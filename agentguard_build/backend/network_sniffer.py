

import time
import threading
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Optional, Tuple



import os

# --- Detection Thresholds ---
# These are loaded from env vars so we can tune them without a rebuild.

# Beaconing: same host contacted this many times within the window
BEACON_COUNT_THRESHOLD   = int(os.environ.get("AG_BEACON_THRESHOLD",    "10"))
BEACON_WINDOW_SECONDS    = int(os.environ.get("AG_BEACON_WINDOW",        "60"))

# Threshold for bytes sent in a single connection (default 5MB)
SINGLE_CONN_BYTES_LIMIT  = int(os.environ.get("AG_SINGLE_CONN_BYTES", str(5 * 1024 * 1024)))

# Reconnaissance: unique destinations per agent within window
UNIQUE_DEST_THRESHOLD    = int(os.environ.get("AG_UNIQUE_DEST_THRESHOLD", "30"))
UNIQUE_DEST_WINDOW       = int(os.environ.get("AG_UNIQUE_DEST_WINDOW",    "120"))

# Port diversity: connecting to N different ports on the same host
PORT_SCAN_THRESHOLD      = int(os.environ.get("AG_PORT_SCAN_THRESHOLD",   "10"))
PORT_SCAN_WINDOW         = int(os.environ.get("AG_PORT_SCAN_WINDOW",       "30"))

# DNS tunneling: subdomain length check
DNS_TUNNEL_SUBDOMAIN_LEN = int(os.environ.get("AG_DNS_TUNNEL_LEN",        "50"))

# Rapid retry: repeated failed connections
RETRY_THRESHOLD          = int(os.environ.get("AG_RETRY_THRESHOLD",        "5"))
RETRY_WINDOW             = int(os.environ.get("AG_RETRY_WINDOW",           "30"))

# Known bad ports (mostly Metasploit, Tor, IRC, etc.)
SUSPICIOUS_PORTS = {
    4444, 4445, 4446,        # Metasploit
    1337, 31337,             # "Elite" ports
    6667, 6668, 6669, 6697,  # IRC C2
    9001, 9030, 9050, 9051,  # Tor
    1080,                    # SOCKS
    3128, 8118,              # Proxies
    65535, 65534,            # High port shells
}

# Allowed business hours (0-23). Empty string = 24/7.
# Example: AG_ALLOWED_HOURS=8-18
_allowed_hours_env = os.environ.get("AG_ALLOWED_HOURS", "")
ALLOWED_HOURS: Optional[Tuple[int, int]] = None
if _allowed_hours_env:
    try:
        start, end = _allowed_hours_env.split("-")
        ALLOWED_HOURS = (int(start), int(end))
    except ValueError:
        pass


# --- Data Structures ---

@dataclass
class SnifferSession:
    """State for a single connection. Nuked when on_disconnect is called."""
    session_id:   str
    agent:        str
    dst_host:     str
    dst_port:     int
    start_time:   float = field(default_factory=time.time)
    bytes_out:    int   = 0
    bytes_in:     int   = 0
    failed:       bool  = False

    @property
    def duration(self) -> float:
        return time.time() - self.start_time


@dataclass
class SnifferFinding:
    """
    Evidence of a network threat. 
    NOTE: We only store metadata here. Never store raw payload bytes.
    """
    threat_type:  str           # "beaconing" | "port_scan" | "data_volume" | etc.
    severity:     str           # "low" | "medium" | "high" | "critical"
    score:        int           # 0-100
    agent:        str
    dst_host:     str
    dst_port:     int
    description:  str           # human-readable explanation
    evidence:     dict          # counters and metadata — never raw bytes
    ts:           float = field(default_factory=time.time)


# --- Traffic Analyser ---
# Handles the heavy lifting of aggregating cross-connection state.

class TrafficAnalyser:
    """
    Rolling-window counters for every agent.
    Again: counts, timestamps, hosts only. No payloads.
    """

    def __init__(self):
        self._lock = threading.Lock()
        # agent → deque of (timestamp, dst_host, dst_port)
        self._conn_history: Dict[str, Deque[Tuple[float, str, int]]] = \
            defaultdict(lambda: deque(maxlen=1000))
        # agent → deque of (timestamp, dst_host, dst_port) for failed conns
        self._fail_history: Dict[str, Deque[Tuple[float, str, int]]] = \
            defaultdict(lambda: deque(maxlen=200))
        # agent → total bytes out (rolling, reset hourly)
        self._bytes_out: Dict[str, int] = defaultdict(int)
        self._bytes_reset_ts: float = time.time()

    def record_connection(self, agent: str, dst_host: str, dst_port: int):
        with self._lock:
            self._conn_history[agent].append((time.time(), dst_host, dst_port))

    def record_failure(self, agent: str, dst_host: str, dst_port: int):
        with self._lock:
            self._fail_history[agent].append((time.time(), dst_host, dst_port))

    def record_bytes(self, agent: str, direction: str, count: int):
        if direction == "out":
            with self._lock:
                self._bytes_out[agent] += count

    def analyse(self, session: SnifferSession) -> List[SnifferFinding]:
        """Runs the whole suite of detectors against current agent state."""
        findings = []
        with self._lock:
            conns = list(self._conn_history[session.agent])
            fails = list(self._fail_history[session.agent])
            total_out = self._bytes_out[session.agent]

        findings += self._detect_beaconing(session, conns)
        findings += self._detect_port_scan(session, conns)
        findings += self._detect_unique_dest(session, conns)
        findings += self._detect_data_volume(session, total_out)
        findings += self._detect_retry_storm(session, fails)
        findings += self._detect_suspicious_port(session)
        findings += self._detect_dns_tunnel(session)
        findings += self._detect_off_hours(session)

        return findings

    # ── Detectors ─────────────────────────────────────────────────────────

    def _detect_beaconing(self, session: SnifferSession,
                          conns: List) -> List[SnifferFinding]:
        """Looks for regular intervals to the same host (C2 beaconing)."""
        cutoff = time.time() - BEACON_WINDOW_SECONDS
        recent = [c for c in conns
                  if c[0] > cutoff and c[1] == session.dst_host]
        if len(recent) < BEACON_COUNT_THRESHOLD:
            return []

        # Check for regularity (C2 beacons are periodic)
        if len(recent) >= 3:
            intervals = [recent[i+1][0] - recent[i][0]
                         for i in range(len(recent)-1)]
            avg_interval = sum(intervals) / len(intervals)
            variance     = sum((x - avg_interval)**2 for x in intervals) / len(intervals)
            is_periodic  = variance < (avg_interval * 0.3) ** 2

            if is_periodic:
                return [SnifferFinding(
                    threat_type = "beaconing",
                    severity    = "critical",
                    score       = 90,
                    agent       = session.agent,
                    dst_host    = session.dst_host,
                    dst_port    = session.dst_port,
                    description = (
                        f"Agent '{session.agent}' contacted {session.dst_host} "
                        f"{len(recent)}x in {BEACON_WINDOW_SECONDS}s with "
                        f"regular ~{avg_interval:.1f}s intervals — C2 beacon pattern"
                    ),
                    evidence    = {
                        "connection_count":  len(recent),
                        "window_seconds":    BEACON_WINDOW_SECONDS,
                        "avg_interval_s":    round(avg_interval, 2),
                        "variance":          round(variance, 4),
                        "is_periodic":       is_periodic,
                        "dst_host":          session.dst_host,
                    },
                )]

        return [SnifferFinding(
            threat_type = "beaconing",
            severity    = "high",
            score       = 70,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' contacted {session.dst_host} "
                f"{len(recent)}x in {BEACON_WINDOW_SECONDS}s"
            ),
            evidence    = {
                "connection_count": len(recent),
                "window_seconds":   BEACON_WINDOW_SECONDS,
                "dst_host":         session.dst_host,
            },
        )]

    def _detect_port_scan(self, session: SnifferSession,
                          conns: List) -> List[SnifferFinding]:
        """Hit too many ports on one host? Flag as port scan."""
        cutoff = time.time() - PORT_SCAN_WINDOW
        ports  = set(c[2] for c in conns
                     if c[0] > cutoff and c[1] == session.dst_host)
        if len(ports) < PORT_SCAN_THRESHOLD:
            return []
        return [SnifferFinding(
            threat_type = "port_scan",
            severity    = "high",
            score       = 80,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' connected to {len(ports)} distinct ports "
                f"on {session.dst_host} within {PORT_SCAN_WINDOW}s — port scan"
            ),
            evidence    = {
                "port_count":    len(ports),
                "dst_host":      session.dst_host,
                "window_seconds": PORT_SCAN_WINDOW,
            },
        )]

    def _detect_unique_dest(self, session: SnifferSession,
                            conns: List) -> List[SnifferFinding]:
        """Wide net traversal - classic recon pattern."""
        cutoff = time.time() - UNIQUE_DEST_WINDOW
        hosts  = set(c[1] for c in conns if c[0] > cutoff)
        if len(hosts) < UNIQUE_DEST_THRESHOLD:
            return []
        return [SnifferFinding(
            threat_type = "recon",
            severity    = "high",
            score       = 75,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' contacted {len(hosts)} unique hosts "
                f"in {UNIQUE_DEST_WINDOW}s — possible recon/lateral movement"
            ),
            evidence    = {
                "unique_host_count": len(hosts),
                "window_seconds":    UNIQUE_DEST_WINDOW,
                "threshold":         UNIQUE_DEST_THRESHOLD,
            },
        )]

    def _detect_data_volume(self, session: SnifferSession,
                            total_out: int) -> List[SnifferFinding]:
        """Single connection sending too much data = exfiltration attempt."""
        if session.bytes_out < SINGLE_CONN_BYTES_LIMIT:
            return []
        mb = session.bytes_out / (1024 * 1024)
        return [SnifferFinding(
            threat_type = "data_volume",
            severity    = "high",
            score       = 75,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' sent {mb:.1f} MB in one connection "
                f"to {session.dst_host} — possible data exfiltration"
            ),
            evidence    = {
                "bytes_sent":   session.bytes_out,
                "bytes_mb":     round(mb, 2),
                "threshold_mb": round(SINGLE_CONN_BYTES_LIMIT / (1024*1024), 1),
                "duration_s":   round(session.duration, 1),
                "dst_host":     session.dst_host,
            },
        )]

    def _detect_retry_storm(self, session: SnifferSession,
                            fails: List) -> List[SnifferFinding]:
        """Rapid repeated failures to same host = probe pattern."""
        cutoff  = time.time() - RETRY_WINDOW
        recent  = [f for f in fails
                   if f[0] > cutoff and f[1] == session.dst_host]
        if len(recent) < RETRY_THRESHOLD:
            return []
        return [SnifferFinding(
            threat_type = "retry_storm",
            severity    = "medium",
            score       = 55,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' failed to connect to "
                f"{session.dst_host} {len(recent)}x in {RETRY_WINDOW}s"
            ),
            evidence    = {
                "failure_count":  len(recent),
                "window_seconds": RETRY_WINDOW,
                "dst_host":       session.dst_host,
            },
        )]

    def _detect_suspicious_port(self,
                                session: SnifferSession) -> List[SnifferFinding]:
        """Connection to a known malware/C2/reverse-shell port."""
        if session.dst_port not in SUSPICIOUS_PORTS:
            return []
        port_labels = {
            4444: "Metasploit default", 1337: "leet port",
            31337: "elite port", 6667: "IRC",
            9050: "Tor SOCKS", 9051: "Tor control",
            1080: "SOCKS proxy", 65535: "high port (reverse shell)",
        }
        label = port_labels.get(session.dst_port, "known suspicious port")
        return [SnifferFinding(
            threat_type = "suspicious_port",
            severity    = "high",
            score       = 70,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' connected to port {session.dst_port} "
                f"on {session.dst_host} ({label})"
            ),
            evidence    = {
                "dst_port":   session.dst_port,
                "port_label": label,
                "dst_host":   session.dst_host,
            },
        )]

    def _detect_dns_tunnel(self,
                           session: SnifferSession) -> List[SnifferFinding]:
        """Suspiciously long subdomains = DNS tunnelling."""
        parts = session.dst_host.split(".")
        if len(parts) < 3:
            return []
        # Check if any subdomain label is unusually long (base64/hex encoded data)
        long_labels = [p for p in parts[:-2] if len(p) > DNS_TUNNEL_SUBDOMAIN_LEN]
        if not long_labels:
            return []
        return [SnifferFinding(
            threat_type = "dns_tunnel",
            severity    = "high",
            score       = 75,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' used suspiciously long subdomain "
                f"({max(len(p) for p in long_labels)} chars) — possible DNS tunnelling"
            ),
            evidence    = {
                "dst_host":         session.dst_host,
                "long_label_count": len(long_labels),
                "max_label_length": max(len(p) for p in long_labels),
                "threshold":        DNS_TUNNEL_SUBDOMAIN_LEN,
            },
        )]

    def _detect_off_hours(self,
                          session: SnifferSession) -> List[SnifferFinding]:
        """Connection outside allowed business hours."""
        if not ALLOWED_HOURS:
            return []
        import datetime
        hour = datetime.datetime.now().hour
        start, end = ALLOWED_HOURS
        if start <= hour < end:
            return []
        return [SnifferFinding(
            threat_type = "off_hours",
            severity    = "low",
            score       = 30,
            agent       = session.agent,
            dst_host    = session.dst_host,
            dst_port    = session.dst_port,
            description = (
                f"Agent '{session.agent}' connected to {session.dst_host} "
                f"outside allowed hours ({start}:00–{end}:00), current hour={hour}"
            ),
            evidence    = {
                "hour":          hour,
                "allowed_start": start,
                "allowed_end":   end,
                "dst_host":      session.dst_host,
            },
        )]

    def reset_agent(self, agent: str):
        """Clear all history for an agent (used after kill or demo reset)."""
        with self._lock:
            self._conn_history.pop(agent, None)
            self._fail_history.pop(agent, None)
            self._bytes_out.pop(agent, None)


# --- Public API ---

class NetworkSniffer:
    """
    Wire this into the proxy:

        session  = network_sniffer.on_connect("python3", "1.2.3.4", 443)
        network_sniffer.on_bytes(session, "out", 1024)
        findings = network_sniffer.on_disconnect(session)
    """

    def __init__(self):
        self._analyser  = TrafficAnalyser()
        self._lock      = threading.Lock()
        self._sessions: Dict[str, SnifferSession] = {}
        self._session_counter = 0

    def on_connect(self, agent: str, dst_host: str,
                   dst_port: int) -> SnifferSession:
        """Call when a new connection is established."""
        with self._lock:
            self._session_counter += 1
            sid = f"{agent}-{self._session_counter}"

        session = SnifferSession(
            session_id = sid,
            agent      = agent,
            dst_host   = dst_host,
            dst_port   = dst_port,
        )
        self._analyser.record_connection(agent, dst_host, dst_port)
        with self._lock:
            self._sessions[sid] = session
        return session

    def on_bytes(self, session: SnifferSession,
                 direction: str, count: int) -> None:
        """Call as bytes flow through the connection."""
        if direction == "out":
            session.bytes_out += count
        else:
            session.bytes_in  += count
        self._analyser.record_bytes(session.agent, direction, count)

    def on_failure(self, session: SnifferSession) -> None:
        """Call when a connection attempt fails."""
        session.failed = True
        self._analyser.record_failure(
            session.agent, session.dst_host, session.dst_port)

    def on_disconnect(self, session: SnifferSession) -> List[SnifferFinding]:
        """
        Call when a connection closes.
        Returns any threat findings — empty list means clean.
        Session object is discarded here.
        """
        findings = self._analyser.analyse(session)
        with self._lock:
            self._sessions.pop(session.session_id, None)
        # session goes out of scope — GC reclaims it
        return findings

    def active_session_count(self) -> int:
        with self._lock:
            return len(self._sessions)

    def reset_agent(self, agent: str):
        self._analyser.reset_agent(agent)


# --- Singletons ---
# Shared instances used by the proxy and policy daemon.

network_sniffer  = NetworkSniffer()
traffic_analyser = network_sniffer._analyser
