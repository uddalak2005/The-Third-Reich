"""
AgentGuard Transparent Proxy
- Intercepts HTTP/HTTPS traffic
- Scans request bodies for prompt injections
- Enforces policy rules before forwarding
"""

import os
import sys
import ssl
import json
import time
import socket
import ipaddress
import threading
import logging
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timezone

import yaml
import structlog

# --- Internal Modules ---
import sys as _sys
from pathlib import Path as _Path
_backend = _Path(__file__).parent.parent / "backend"
if str(_backend) not in _sys.path:
    _sys.path.insert(0, str(_backend))

try:
    from file_inspector import file_inspector
    from network_sniffer import network_sniffer
    BACKEND_MODULES_OK = True
except ImportError:
    BACKEND_MODULES_OK = False
    class _DummyFI:
        def inspect(self, *a, **kw):
            return type("R", (), {"is_malicious": False, "verdict": "allow",
                                  "total_score": 0, "findings": [],
                                  "should_block": False})()  # noqa
        def inspect_multipart(self, *a, **kw): return []
    class _DummySniffer:
        def on_connect(self, *a, **kw): return None
        def on_bytes(self, s, *a, **kw): pass
        def on_failure(self, s, *a, **kw): pass
        def on_disconnect(self, s): return []
        def active_session_count(self): return 0
    file_inspector  = _DummyFI()
    network_sniffer = _DummySniffer()

# --- Advanced Normalizer ---
try:
    _proxy_dir = _Path(__file__).parent
    if str(_proxy_dir) not in _sys.path:
        _sys.path.insert(0, str(_proxy_dir))
    from advanced_normalizer import advanced_normalizer
    NORMALIZER_OK = True
except ImportError:
    NORMALIZER_OK = False
    advanced_normalizer = None

# TLS interceptor - MITM HTTPS to scan plaintext
try:
    from tls_interceptor import get_interceptor
    _tls_interceptor = get_interceptor()
    TLS_INTERCEPT = _tls_interceptor is not None
except Exception:
    _tls_interceptor = None
    TLS_INTERCEPT = False

# --- Verdicts ---
# Match policy_daemon.py and the BPF constants.

VERDICT_ALLOW   = 0
VERDICT_BLOCK   = 1
VERDICT_SANDBOX = 2
VERDICT_KILL    = 3

# --- Injection Patterns ---
# Standard prompt injection and credential leak signatures.

INJECTION_PATTERNS: List[Tuple[bytes, int, str]] = [
    (b"ignore",    40, "ignore-instructions"),
    (b"dan",       30, "DAN-jailbreak"),
    (b"<|system",  50, "system-token-injection"),
    (b"system:",   35, "system-colon"),
    (b"[inst]",    45, "llama-inst"),
    (b"bearer ",   25, "bearer-in-body"),
    (b"sk-",       35, "openai-key-leak"),
    (b"ghp_",      40, "github-pat-leak"),
    (b"akia",      40, "aws-key-leak"),
    # Additional patterns only feasible in userspace (too slow for BPF)
    (b"ignore all previous",    60, "ignore-all-previous"),
    (b"disregard",              35, "disregard-instructions"),
    (b"forget your instructions",55,"forget-instructions"),
    (b"you are now",            25, "persona-override"),
    (b"act as if",              25, "act-as-override"),
    (b"pretend you",            25, "pretend-override"),
    (b"jailbreak",              45, "explicit-jailbreak"),
    (b"do anything now",        50, "DAN-explicit"),
    (b"<|im_start|>system",     55, "chatml-system-injection"),
    (b"### instruction:",       45, "alpaca-instruction-injection"),
]

def inspect_body(body: bytes) -> Tuple[int, List[str]]:
    """
    Run all injection + credential patterns against request body.
    Now includes advanced normalization:
      - binary/hex/homoglyph/RTL/zero-width obfuscation stripping
      - sleepy agent marker detection
      - CoT forging detection
      - context overflow detection
    Returns (score, matched_pattern_names).
    """
    if not body:
        return 0, []

    try:
        text = body.decode('utf-8', errors='replace')
    except Exception:
        text = body.decode('latin-1', errors='replace')

    try:
        if NORMALIZER_OK and advanced_normalizer:
            normalized_text, norm_findings = advanced_normalizer.normalize(text)
            obfuscation_bonus = advanced_normalizer.score_bonus(norm_findings)
            scan_body = normalized_text.lower().encode('utf-8', errors='replace')
        else:
            scan_body = body.lower()
            obfuscation_bonus = 0
            norm_findings = []
    except Exception as e:
        print(f"DEBUG: inspect_body FAILED: {e}")
        scan_body = body.lower()
        obfuscation_bonus = 0
        norm_findings = []

    score   = 0
    matched = []
    for pattern, weight, name in INJECTION_PATTERNS:
        if pattern in scan_body:
            score  += weight
            matched.append(name)

    score += obfuscation_bonus
    for f in norm_findings:
        matched.append(f.layer)

    return score, matched


def scan_response(response_text: str) -> Tuple[str, List[dict], int]:
    """
    Scan an LLM response for threats (sleepy agent, CoT forging, leaks).
    Returns (sanitized_text, findings, score).
    """
    try:
        from response_scanner import response_scanner
        findings, score = response_scanner.scan(response_text)
        if score >= 35:
            sanitized, _ = response_scanner.sanitize(response_text)
            return sanitized, [f.__dict__ for f in findings], score
        return response_text, [f.__dict__ for f in findings], score
    except Exception as e:
        # Use global logger if proxy_log not available
        import structlog
        structlog.get_logger().error("response_scan_error", err=str(e))
        return response_text, [], 0

# --- Policy Engine ---
# Evaluates requests against logic in policy.yaml.

class PolicyEngine:
    """
    Loads policy.yaml and evaluates verdicts for each request.
    Shared between ProxyHandler threads via a lock.
    """

    def __init__(self, config_path: str):
        self.config_path    = config_path
        self._lock          = threading.RLock()
        self.policies:       Dict[str, dict] = {}
        self.policies_by_id: Dict[int, dict] = {}
        self.blocked_cidrs:  List[ipaddress.IPv4Network] = []
        self.blocked_ips:    set = set()
        self.default_policy: str = "restricted"
        self.log = structlog.get_logger()
        self.load()

    def load(self) -> None:
        with open(self.config_path) as f:
            cfg = yaml.safe_load(f)

        with self._lock:
            self.policies       = {}
            self.policies_by_id = {}

            for p in cfg.get("policies", []):
                pol = {
                    "id":                   p["id"],
                    "name":                 p["name"],
                    "allowed_ports":        set(p.get("allowed_ports", [])),
                    "max_bytes_per_sec":    p.get("max_bytes_per_sec", 10_485_760),
                    "allow_external_net":   p.get("allow_external_net", False),
                    "inspect_http":         p.get("inspect_http", True),
                    "block_on_injection":   p.get("block_on_injection", True),
                    "allow_exec":           p.get("allow_exec", False),
                    "allow_fork":           p.get("allow_fork", False),
                }
                self.policies[pol["name"]]     = pol
                self.policies_by_id[pol["id"]] = pol

            self.default_policy = cfg.get("global", {}).get(
                "default_policy", "restricted")

            self.blocked_cidrs = []
            self.blocked_ips   = set()
            for cidr in cfg.get("threat_intel", {}).get("blocked_ips", []):
                try:
                    net = ipaddress.IPv4Network(cidr, strict=False)
                    self.blocked_cidrs.append(net)
                    for host in net.hosts():
                        self.blocked_ips.add(str(host))
                except ValueError:
                    pass

        self.log.info("policy_engine_loaded",
                      policies=len(self.policies),
                      blocked_cidrs=len(self.blocked_cidrs))

    def get_policy(self, policy_name: Optional[str] = None) -> dict:
        with self._lock:
            name = policy_name or self.default_policy
            return (self.policies.get(name)
                    or self.policies.get("restricted")
                    or next(iter(self.policies.values()), {}))

    def is_blocked_ip(self, ip: str) -> bool:
        with self._lock:
            return ip in self.blocked_ips

    def block_ip(self, ip: str) -> None:
        with self._lock:
            self.blocked_ips.add(ip)
        self.log.info("ip_blocked_realtime", ip=ip)

    def evaluate(
        self,
        dst_host:    str,
        dst_port:    int,
        method:      str,
        path:        str,
        headers:     Dict[str, str],
        body:        bytes,
        agent_name:  Optional[str] = None,
        policy_name: Optional[str] = None,
    ) -> Tuple[int, str, dict]:
        """
        Evaluate a request against policy rules.

        Returns:
            (verdict_code, reason, detail_dict)
        """
        detail: dict = {
            "dst_host":    dst_host,
            "dst_port":    dst_port,
            "method":      method,
            "path":        path,
            "agent":       agent_name,
            "policy":      policy_name or self.default_policy,
            "ts":          int(time.time_ns()),
        }

        # ── 1. Blocked IP check ────────────────────────────────────────────
        try:
            dst_ip = socket.gethostbyname(dst_host)
            detail["dst_ip"] = dst_ip
            if self.is_blocked_ip(dst_ip):
                detail["injection_score"] = 0
                return VERDICT_BLOCK, "blocked_ip", detail
        except socket.gaierror:
            dst_ip = dst_host

        # ── 2. Load policy ─────────────────────────────────────────────────
        pol = self.get_policy(policy_name)

        # ── 3. Port whitelist ──────────────────────────────────────────────
        allowed_ports = pol.get("allowed_ports", set())
        if allowed_ports and dst_port not in allowed_ports:
            return VERDICT_BLOCK, "port_not_allowed", detail

        # ── 4. External network restriction ───────────────────────────────
        if not pol.get("allow_external_net", True):
            try:
                addr = ipaddress.IPv4Address(dst_ip)
                if not addr.is_private:
                    return VERDICT_BLOCK, "external_net_blocked", detail
            except ValueError:
                pass

        # ── 5. HTTP body inspection ────────────────────────────────────────
        if pol.get("inspect_http", True) and body:
            score, matches = inspect_body(body)
            detail["injection_score"]    = score
            detail["injection_patterns"] = matches
            import random as _r
            _threshold = 35 + _r.randint(-7, 7)
            detail["block_threshold"] = _threshold
            if score >= _threshold:
                detail["body_sample"] = body[:120].decode(errors="replace")
                if pol.get("block_on_injection", True):
                    return VERDICT_BLOCK, f"injection:{','.join(matches)}", detail

        # ── 6. File upload inspection ──────────────────────
        content_type = (headers or {}).get(
            "content-type",
            (headers or {}).get("Content-Type", "")
        ) or ""
        if body and "multipart/form-data" in content_type.lower():
            file_results = file_inspector.inspect_multipart(body, content_type)
            for fr in file_results:
                if fr.is_malicious:
                    detail["file_scan"] = {
                        "filename":  fr.file_name,
                        "file_type": fr.file_type,
                        "score":     fr.total_score,
                        "verdict":   fr.verdict,
                        "findings":  [
                            {"pattern":  f.pattern_label,
                             "location": f.location,
                             "excerpt":  f.excerpt,
                             "score":    f.score}
                            for f in fr.findings
                        ],
                    }
                    if fr.should_block and pol.get("block_on_injection", True):
                        return VERDICT_BLOCK, f"malicious_file:{fr.file_name}", detail

        detail["injection_score"] = 0
        # Record clean request - reduce tarpit strikes
        try:
            import sys as _s
            from pathlib import Path as _P
            _bd = str(_P(__file__).parent.parent / "backend")
            if _bd not in _s.path: _s.path.insert(0, _bd)
            from rate_limiter import rate_limiter
            rate_limiter.record_allow(agent_name or "unknown")
        except Exception: pass
        return VERDICT_ALLOW, "ok", detail

# --- Event Store ---
# Shared bounded log for the /api/events route.

class EventStore:
    """Thread-safe bounded event log readable by the FastAPI /api/events route."""

    MAX_EVENTS = 10_000

    def __init__(self):
        self._lock   = threading.Lock()
        self._events: List[dict] = []
        self.stats = {
            "requests_seen":    0,
            "requests_blocked": 0,
            "injections_found": 0,
            "bytes_proxied":    0,
        }

    def push(self, event: dict) -> None:
        with self._lock:
            self.stats["requests_seen"] += 1
            if event.get("verdict") == "block":
                self.stats["requests_blocked"] += 1
            if event.get("injection_score", 0) > 0:
                self.stats["injections_found"] += 1
            self.stats["bytes_proxied"] += event.get("response_bytes", 0)
            self._events.append(event)
            if len(self._events) > self.MAX_EVENTS:
                self._events.pop(0)

    def recent(self, limit: int = 100, threat_only: bool = False) -> List[dict]:
        with self._lock:
            events = list(self._events)
        if threat_only:
            events = [e for e in events if e.get("verdict") != "allow"]
        return events[-limit:]

    def get_stats(self) -> dict:
        with self._lock:
            return dict(self.stats)

# --- Proxy Handler ---
# One instance of this runs per connection in its own thread.

import select
import threading
import http.server
import http.client
import urllib.parse

MAX_BODY_READ  = 512 * 1024   # 512 KB max body to inspect (streaming agents)
CONNECT_TIMEOUT = 30          # seconds (increased for Docker DNS latency)

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    """
    Handles both plain HTTP and HTTPS CONNECT tunnels.

    Injected by ProxyServer:
        self.policy_engine  — PolicyEngine instance
        self.event_store    — EventStore instance
        self.ca_cert_path   — path to CA cert file (for HTTPS)
        self.ca_key_path    — path to CA key file
        self.proxy_log      — structlog logger
    """

    # Suppress default BaseHTTPRequestHandler logging
    def log_message(self, fmt, *args):
        pass

    def log_error(self, fmt, *args):
        pass

    # --- Agent Identity ---
    def _agent_name(self) -> Optional[str]:
        """
        Try to identify the agent from X-AgentGuard-Agent header
        or the User-Agent string.
        """
        return (self.headers.get("X-AgentGuard-Agent")
                or self.headers.get("User-Agent", "unknown")[:64])

    def _policy_name(self) -> Optional[str]:
        return self.headers.get("X-AgentGuard-Policy")

    # --- CONNECT (HTTPS Tunnel) ---
    def do_CONNECT(self):
        host, _, port_str = self.path.partition(":")
        port = int(port_str) if port_str else 443

        # Block HTTP/2 and WebSocket upgrade attempts
        # HTTP/2 cleartext (h2c) would bypass TLS inspection
        upgrade = self.headers.get("Upgrade", "").lower()
        if upgrade in ("h2c", "h2", "websocket"):
            self.proxy_log.warning("protocol_upgrade_blocked",
                                   host=host, upgrade=upgrade)
            self._send_error(426, "AgentGuard: protocol upgrade not permitted")
            return


        # Policy check before opening connection
        verdict, reason, detail = self.policy_engine.evaluate(
            dst_host    = host,
            dst_port    = port,
            method      = "CONNECT",
            path        = self.path,
            headers     = dict(self.headers),
            body        = b"",
            agent_name  = self._agent_name(),
            policy_name = self._policy_name(),
        )

        if verdict == VERDICT_BLOCK:
            self._send_block(reason, detail)
            return

        if verdict == VERDICT_SANDBOX:
            host, port = self._sandbox_redirect(host, port)

        # Open remote connection FIRST before telling client "200 OK"
        # Sending 200 before connect causes WinError 10053 on Windows
        _sniff = network_sniffer.on_connect(
            agent    = self._agent_name(),
            dst_host = host,
            dst_port = port,
        )
        detail["_sniffer_session"] = _sniff

        try:
            # Resolve hostname explicitly so errors are clear in logs
            try:
                socket.getaddrinfo(host, port)
            except socket.gaierror as dns_err:
                self.proxy_log.error("dns_resolution_failed",
                                     host=host, err=str(dns_err))
            remote = socket.create_connection((host, port),
                                              timeout=CONNECT_TIMEOUT)
        except (socket.error, OSError) as e:
            self.proxy_log.warning("connect_failed",
                                   host=host, port=port, err=str(e))
            network_sniffer.on_failure(_sniff)
            network_sniffer.on_disconnect(_sniff)
            self._send_error(502, "AgentGuard: cannot reach upstream")
            return

        # Upstream confirmed reachable - now tell client tunnel is open
        self.send_response(200, "Connection established")
        self.end_headers()

        if TLS_INTERCEPT and port == 443:
            # TLS intercept: close plain TCP, interceptor opens its own TLS
            try: remote.close()
            except Exception: pass
            _tls_interceptor.intercept(
                client_sock   = self.connection,
                host          = host,
                port          = port,
                detail        = detail,
                policy_engine = self.policy_engine,
                event_store   = self.event_store,
                inspect_fn    = inspect_body,
                sniffer       = network_sniffer,
            )
        else:
            self._relay(self.connection, remote, detail)

    # --- Plain HTTP ---
    def _handle_http(self):
        parsed   = urllib.parse.urlparse(self.path)
        host     = parsed.hostname or self.headers.get("Host", "").split(":")[0]
        port     = parsed.port or 80
        req_path = parsed.path or "/"
        if parsed.query:
            req_path += "?" + parsed.query

        # Read body
        body = b""
        content_len = int(self.headers.get("Content-Length", 0))
        if content_len:
            body = self.rfile.read(min(content_len, MAX_BODY_READ))

        # Policy evaluation
        verdict, reason, detail = self.policy_engine.evaluate(
            dst_host    = host,
            dst_port    = port,
            method      = self.command,
            path        = req_path,
            headers     = dict(self.headers),
            body        = body,
            agent_name  = self._agent_name(),
            policy_name = self._policy_name(),
        )

        if verdict == VERDICT_BLOCK:
            self._send_block(reason, detail)
            return

        if verdict == VERDICT_SANDBOX:
            host, port = self._sandbox_redirect(host, port)

        # Attach sniffer session
        _sniff_http = network_sniffer.on_connect(
            agent    = self._agent_name(),
            dst_host = host,
            dst_port = port,
        )
        detail["_sniffer_session"] = _sniff_http

        # Forward to real destination
        try:
            conn = http.client.HTTPConnection(host, port,
                                              timeout=CONNECT_TIMEOUT)
            # Strip proxy-specific headers
            forward_headers = {
                k: v for k, v in self.headers.items()
                if k.lower() not in ("proxy-connection", "x-agentguard-agent",
                                     "x-agentguard-policy")
            }
            conn.request(self.command, req_path, body=body or None,
                         headers=forward_headers)
            resp = conn.getresponse()

            self.send_response(resp.status, resp.reason)
            for header, value in resp.getheaders():
                if header.lower() not in ("transfer-encoding",):
                    self.send_header(header, value)
            self.end_headers()

            resp_body = resp.read()
            resp_body_text = resp_body.decode('utf-8', errors='replace')
            sanitized_body, resp_findings, resp_score = scan_response(resp_body_text)
            
            if resp_score >= 35:
                resp_body = sanitized_body.encode('utf-8', errors='replace')
                detail["response_blocked"] = True
                detail["response_findings"] = resp_findings
                detail["response_score"] = resp_score
            
            self.wfile.write(resp_body)
            detail["response_status"] = resp.status
            detail["response_bytes"]  = len(resp_body)

        except Exception as e:
            self.proxy_log.warning("http_forward_error",
                                   host=host, err=str(e))
            self._send_error(502, f"AgentGuard: upstream error: {e}")
            detail["error"] = str(e)

        self._log_event(verdict, reason, detail)

    # Route all HTTP methods
    do_GET     = _handle_http
    do_POST    = _handle_http
    do_PUT     = _handle_http
    do_PATCH   = _handle_http
    do_DELETE  = _handle_http
    do_HEAD    = _handle_http
    do_OPTIONS = _handle_http

    # --- Relay ---
    def _relay(self, client_sock, remote_sock, detail: dict):
        """
        Bidirectional byte relay. 
        NOTE: We don't peek here to avoid racing with TLS handshakes.
        """
        total_bytes_out = 0
        total_bytes_in  = 0
        _rs = detail.get("_sniffer_session")

        client_sock.setblocking(True)
        remote_sock.setblocking(True)

        try:
            socks = [client_sock, remote_sock]
            while True:
                try:
                    readable, _, exceptional = select.select(
                        socks, [], socks, 30.0)
                except (ValueError, OSError):
                    break

                if exceptional:
                    break

                if not readable:
                    continue

                for s in readable:
                    other = remote_sock if s is client_sock else client_sock
                    try:
                        data = s.recv(65536)
                        if not data:
                            return
                        other.sendall(data)
                        if s is client_sock:
                            total_bytes_out += len(data)
                            if _rs:
                                network_sniffer.on_bytes(_rs, "out", len(data))
                        else:
                            total_bytes_in += len(data)
                            if _rs:
                                network_sniffer.on_bytes(_rs, "in", len(data))
                    except (socket.error, OSError):
                        return

        finally:
            detail["response_bytes"] = total_bytes_in
            detail["request_bytes"]  = total_bytes_out
            self._log_event(VERDICT_ALLOW, "ok", detail)
            for s in (client_sock, remote_sock):
                try:
                    s.close()
                except Exception:
                    pass

    # --- Helpers ---
    def _send_block(self, reason: str, detail: dict):
        import time as _t, random as _r
        _t.sleep(_r.uniform(0.01, 0.15))
        body = json.dumps({
            "blocked":    True,
            "reason":     "policy_violation",
            "request_id": str(detail.get("ts", "")),
        }).encode()
        self.send_response(403, "Forbidden")
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-AgentGuard",   "blocked")
        self.end_headers()
        self.wfile.write(body)
        self._log_event(VERDICT_BLOCK, reason, detail)

    def _send_error(self, code: int, message: str, body: bytes = b""):
        self.send_response(code, message)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def _sandbox_redirect(self, host: str, port: int) -> Tuple[str, int]:
        """Redirect to sandbox host instead of real destination."""
        sandbox_host = os.environ.get("AGENTGUARD_SANDBOX_HOST", "127.0.0.1")
        sandbox_port = int(os.environ.get("AGENTGUARD_SANDBOX_PORT", "9999"))
        self.proxy_log.info("sandbox_redirect",
                            from_host=host, to_host=sandbox_host)
        return sandbox_host, sandbox_port

    def _log_event(self, verdict: int, reason: str, detail: dict):
        verdict_str = {0:"allow", 1:"block", 2:"sandbox", 3:"kill"}.get(
            verdict, "unknown")
        # Run network sniffer on every completed connection
        _sniffer_session = detail.pop("_sniffer_session", None)
        sniffer_findings = []
        if _sniffer_session is not None:
            if detail.get("error"):
                network_sniffer.on_failure(_sniffer_session)
            network_sniffer.on_bytes(
                _sniffer_session, "out",
                detail.get("response_bytes", 0))
            sniffer_findings = network_sniffer.on_disconnect(_sniffer_session)

        event = {
            "ts":                detail.get("ts", int(time.time_ns())),
            "event":             "proxy_request",
            "verdict":           verdict_str,
            "reason":            reason,
            "method":            detail.get("method", ""),
            "dst_host":          detail.get("dst_host", ""),
            "dst_port":          detail.get("dst_port", 0),
            "dst_ip":            detail.get("dst_ip", ""),
            "path":              detail.get("path", ""),
            "agent":             detail.get("agent", ""),
            "policy":            detail.get("policy", ""),
            "injection_score":   detail.get("injection_score", 0),
            "injection_patterns":detail.get("injection_patterns", []),
            "body_sample":       detail.get("body_sample", ""),
            "response_status":   detail.get("response_status", 0),
            "response_bytes":    detail.get("response_bytes", 0),
            "file_scan":         detail.get("file_scan"),
            "sniffer_findings":  [
                {"threat_type": f.threat_type, "severity": f.severity,
                 "score": f.score, "description": f.description,
                 "evidence": f.evidence}
                for f in sniffer_findings
            ] if sniffer_findings else None,
        }

        # Emit separate sniffer events for each finding (so they appear
        # as distinct events in the dashboard)
        for sf in sniffer_findings:
            self.event_store.push({
                "ts":          int(time.time_ns()),
                "event":       f"sniffer_{sf.threat_type}",
                "verdict":     "block" if sf.score >= 60 else "alert",
                "reason":      sf.threat_type,
                "agent":       sf.agent,
                "dst_host":    sf.dst_host,
                "dst_port":    sf.dst_port,
                "threat_level": 4 if sf.severity == "critical"
                               else 3 if sf.severity == "high"
                               else 2 if sf.severity == "medium" else 1,
                "description": sf.description,
                "evidence":    sf.evidence,
            })

        self.event_store.push(event)

        log_fn = self.proxy_log.warning if verdict != VERDICT_ALLOW \
                 else self.proxy_log.debug
        log_fn("proxy_request",
               verdict=verdict_str,
               reason=reason,
               dst=f"{detail.get('dst_host')}:{detail.get('dst_port')}",
               method=detail.get("method"),
               score=detail.get("injection_score", 0))

# --- Proxy Server ---
# Manages the socket and worker threads.

import socketserver

class ProxyServer(socketserver.ThreadingTCPServer):
    """
    Threaded TCP server. Each accepted connection gets its own thread
    running a ProxyHandler instance.
    """

    allow_reuse_address = True
    daemon_threads      = True

    def __init__(
        self,
        host:          str,
        port:          int,
        policy_engine: PolicyEngine,
        event_store:   EventStore,
    ):
        self.policy_engine = policy_engine
        self.event_store   = event_store
        self.proxy_log     = structlog.get_logger()

        # Build handler class with injected state
        engine  = policy_engine
        store   = event_store
        plog    = self.proxy_log

        class _Handler(ProxyHandler):
            pass

        _Handler.policy_engine = engine
        _Handler.event_store   = store
        _Handler.proxy_log     = plog

        super().__init__((host, port), _Handler)
        self.proxy_log.info("proxy_started", host=host, port=port)

    def run_in_thread(self) -> threading.Thread:
        t = threading.Thread(target=self.serve_forever, daemon=True)
        t.start()
        return t

    def shutdown_proxy(self):
        self.shutdown()
        self.proxy_log.info("proxy_stopped")

# --- API Routes ---

from fastapi import APIRouter
from pydantic import BaseModel

proxy_router = APIRouter(prefix="/api/proxy", tags=["proxy"])

# These are populated by attach_to_daemon()
_proxy_server:  Optional[ProxyServer]  = None
_event_store:   Optional[EventStore]   = None
_policy_engine: Optional[PolicyEngine] = None


class ProxyStatsOut(BaseModel):
    requests_seen:    int
    requests_blocked: int
    injections_found: int
    bytes_proxied:    int
    proxy_port:       int
    mode:             str


class ProxyEventOut(BaseModel):
    ts:                 int
    event:              str
    verdict:            str
    reason:             str
    method:             str
    dst_host:           str
    dst_port:           int
    path:               str
    agent:              str
    policy:             str
    injection_score:    int
    injection_patterns: List[str]
    response_status:    int
    response_bytes:     int


class BlockIPRequest(BaseModel):
    ip: str


@proxy_router.get("/stats", response_model=ProxyStatsOut,
                  summary="Proxy traffic stats")
async def proxy_stats():
    if not _event_store:
        return ProxyStatsOut(requests_seen=0, requests_blocked=0,
                             injections_found=0, bytes_proxied=0,
                             proxy_port=0, mode="not_started")
    s = _event_store.get_stats()
    return ProxyStatsOut(
        **s,
        proxy_port = _proxy_server.server_address[1] if _proxy_server else 0,
        mode       = "active" if _proxy_server else "stopped",
    )


@proxy_router.get("/events", response_model=List[ProxyEventOut],
                  summary="Recent proxy events")
async def proxy_events(
    limit:       int  = 100,
    threat_only: bool = False,
):
    if not _event_store:
        return []
    return _event_store.recent(limit=limit, threat_only=threat_only)


@proxy_router.post("/block_ip", summary="Block an IP in the proxy engine",
                   status_code=201)
async def proxy_block_ip(body: BlockIPRequest):
    if not _policy_engine:
        raise Exception("Policy engine not initialised")
    _policy_engine.block_ip(body.ip)
    return {"status": "blocked", "ip": body.ip}


@proxy_router.post("/reload", summary="Hot-reload policy.yaml")
async def proxy_reload():
    if not _policy_engine:
        raise Exception("Policy engine not initialised")
    _policy_engine.load()
    return {"status": "reloaded", "policies": len(_policy_engine.policies)}


def attach_to_daemon(
    proxy:  ProxyServer,
    store:  EventStore,
    engine: PolicyEngine,
) -> None:
    """Wire proxy state into the FastAPI router globals."""
    global _proxy_server, _event_store, _policy_engine
    _proxy_server  = proxy
    _event_store   = store
    _policy_engine = engine

# ─────────────────────────────────────────────────────────────────────────────
# Standalone entry point (runs proxy + minimal FastAPI without full daemon)
# ─────────────────────────────────────────────────────────────────────────────

def main():
    import argparse
    import signal as _signal

    parser = argparse.ArgumentParser(description="AgentGuard transparent proxy")
    parser.add_argument("--config",  default="policy.yaml",
                        help="Policy YAML  (default: policy.yaml)")
    parser.add_argument("--port",    type=int, default=8888,
                        help="Proxy listen port  (default: 8888)")
    parser.add_argument("--host",    default="0.0.0.0",
                        help="Proxy bind address  (default: 0.0.0.0)")
    parser.add_argument("--api-port",type=int, default=8889,
                        help="Proxy-only API port  (default: 8889)")
    parser.add_argument("--log-json",action="store_true",
                        help="JSON log output")
    args = parser.parse_args()

    if args.log_json:
        structlog.configure(
            processors=[structlog.processors.JSONRenderer()],
            wrapper_class=structlog.BoundLogger,
        )
    else:
        structlog.configure(
            processors=[structlog.dev.ConsoleRenderer(colors=True)],
            wrapper_class=structlog.BoundLogger,
        )

    log = structlog.get_logger()

    engine = PolicyEngine(args.config)
    store  = EventStore()
    proxy  = ProxyServer(args.host, args.port, engine, store)

    attach_to_daemon(proxy, store, engine)

    proxy_thread = proxy.run_in_thread()

    log.info("agentguard_proxy_ready",
             proxy=f"http://{args.host}:{args.port}",
             api=f"http://{args.host}:{args.api_port}/docs")

    print(f"\n  AgentGuard Proxy running")
    print(f"  ─────────────────────────────────────")
    print(f"  Proxy   → http://localhost:{args.port}")
    print(f"  API     → http://localhost:{args.api_port}/docs")
    print(f"\n  Set on your agent:")
    print(f"  HTTP_PROXY=http://localhost:{args.port}")
    print(f"  HTTPS_PROXY=http://localhost:{args.port}\n")

    # Minimal FastAPI for standalone mode
    import uvicorn
    from fastapi import FastAPI
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def lifespan(app):
        yield
        proxy.shutdown_proxy()

    standalone_app = FastAPI(
        title="AgentGuard Proxy",
        version="1.0.0",
        lifespan=lifespan,
    )
    standalone_app.include_router(proxy_router)

    def _sig(sig, frame):
        proxy.shutdown_proxy()
        sys.exit(0)

    _signal.signal(_signal.SIGTERM, _sig)
    _signal.signal(_signal.SIGINT,  _sig)

    uvicorn.run(standalone_app,
                host=args.host, port=args.api_port, log_level="warning")


if __name__ == "__main__":
    main()