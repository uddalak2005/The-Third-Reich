#!/usr/bin/env python3
"""
AgentGuard Observability CLI
=============================
Real-time terminal dashboard for monitoring agent traffic,
policy decisions, and threat events.

Features:
  - Live event stream from BPF ring buffers
  - Per-agent traffic stats (packets, bytes, blocks, threat level)
  - Threat timeline with color-coded severity
  - HTTP inspection hits with payload preview
  - Syscall intercept log
  - Prometheus metrics export (/metrics endpoint)
  - Exportable JSON/CSV reports

Usage:
    python3 observe.py                         # live dashboard (curses TUI)
    python3 observe.py --stream                # raw event stream (no TUI)
    python3 observe.py --report --out report.json
    python3 observe.py --metrics-port 9090     # Prometheus exporter
    python3 observe.py --tail 100              # last N events and exit

Requirements:
    pip install rich blessed requests prometheus-client
"""

import os
import sys
import time
import json
import signal
import socket
import struct
import ctypes
import threading
import argparse
import ipaddress
from typing import Optional, List, Dict
from collections import deque, defaultdict
from datetime import datetime, timedelta

# ─── Rich for TUI ─────────────────────────────────────────────────────────────
try:
    from rich.console import Console
    from rich.live import Live
    from rich.table import Table
    from rich.panel import Panel
    from rich.layout import Layout
    from rich.text import Text
    from rich.columns import Columns
    from rich.progress import BarColumn, Progress, SpinnerColumn
    from rich.align import Align
    from rich import box
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("[!] Install rich for TUI: pip install rich")

try:
    from prometheus_client import (
        Counter, Gauge, Histogram, start_http_server, REGISTRY
    )
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

import requests

# ─── Constants ─────────────────────────────────────────────────────────────────
DAEMON_URL   = os.environ.get("AGENTGUARD_URL", "http://localhost:8080")
POLL_INTERVAL = 0.5   # seconds between dashboard refreshes
MAX_EVENTS    = 500   # events kept in memory for display

VERDICT_LABELS = {0: "ALLOW", 1: "BLOCK", 2: "SANDBOX", 3: "KILL", 4: "AUDIT"}
VERDICT_COLORS = {0: "green", 1: "red", 2: "yellow", 3: "bold red", 4: "cyan"}
THREAT_LABELS  = {0: "NONE", 1: "LOW", 2: "MEDIUM", 3: "HIGH", 4: "CRITICAL"}
THREAT_COLORS  = {0: "dim", 1: "yellow", 2: "orange1", 3: "red", 4: "bold red"}

PROTO_NAMES = {6: "TCP", 17: "UDP", 1: "ICMP"}

EVENT_ICONS = {
    "packet_seen":       "·",
    "policy_block":      "✗",
    "prompt_injection":  "⚠",
    "data_exfil":        "⬆",
    "dangerous_syscall": "☠",
    "rate_limit":        "⏱",
    "sandbox_redirect":  "⬤",
    "agent_kill":        "💀",
    "tool_abuse":        "⛔",
    "c2_detected":       "☢",
}

# ─────────────────────────────────────────────────────────────────────────────
# Data model
# ─────────────────────────────────────────────────────────────────────────────

class AgentStats:
    def __init__(self, pid: int, name: str):
        self.pid           = pid
        self.name          = name
        self.packets_in    = 0
        self.packets_out   = 0
        self.bytes_in      = 0
        self.bytes_out     = 0
        self.blocked       = 0
        self.injections    = 0
        self.syscall_blocks= 0
        self.threat_level  = 0
        self.policy        = "unknown"
        self.first_seen    = time.time()
        self.last_seen     = time.time()
        # per-second rate tracking
        self._bps_window: deque = deque(maxlen=60)  # 60s history
        self._last_bytes   = 0
        self._last_tick    = time.time()

    def tick_rates(self):
        now = time.time()
        dt  = now - self._last_tick
        if dt > 0:
            bps = (self.bytes_out - self._last_bytes) / dt
            self._bps_window.append(bps)
            self._last_bytes = self.bytes_out
            self._last_tick  = now

    @property
    def avg_bps(self) -> float:
        if not self._bps_window:
            return 0.0
        return sum(self._bps_window) / len(self._bps_window)

    @property
    def threat_color(self) -> str:
        return THREAT_COLORS.get(self.threat_level, "white")

    @property
    def threat_label(self) -> str:
        return THREAT_LABELS.get(self.threat_level, "?")


class EventRecord:
    __slots__ = [
        "ts", "event", "pid", "comm", "src", "dst",
        "proto", "size", "verdict", "threat_level",
        "injection_score", "payload_sample", "syscall",
        "meta",
    ]

    def __init__(self, raw: dict):
        self.ts             = raw.get("ts", 0)
        self.event          = raw.get("event", "unknown")
        self.pid            = raw.get("pid", 0)
        self.comm           = raw.get("comm", "?")
        self.src            = raw.get("src", "?:?")
        self.dst            = raw.get("dst", "?:?")
        self.proto          = raw.get("proto", 0)
        self.size           = raw.get("size", 0)
        self.verdict        = raw.get("verdict", "allow")
        self.threat_level   = raw.get("threat_level", 0)
        self.injection_score= raw.get("injection_score", 0)
        self.payload_sample = raw.get("payload_sample", "")
        self.syscall        = raw.get("syscall", "")
        self.meta           = raw

    @property
    def dt(self) -> str:
        return datetime.fromtimestamp(self.ts / 1e9).strftime("%H:%M:%S.%f")[:-3]

    @property
    def icon(self) -> str:
        return EVENT_ICONS.get(self.event, "?")

    @property
    def verdict_color(self) -> str:
        v = {"allow": "green", "block": "red", "sandbox": "yellow",
             "kill": "bold red", "audit": "cyan"}
        return v.get(self.verdict, "white")

    def is_threat(self) -> bool:
        return self.event not in ("packet_seen",)

# ─────────────────────────────────────────────────────────────────────────────
# Data collector (polls daemon REST API)
# In production this would directly poll the BPF ring buffer via /dev/fd
# ─────────────────────────────────────────────────────────────────────────────

class DataCollector:
    def __init__(self, daemon_url: str):
        self.url          = daemon_url
        self.running      = False
        self.connected    = False
        self._lock        = threading.Lock()

        self.events: deque[EventRecord] = deque(maxlen=MAX_EVENTS)
        self.agents: Dict[int, AgentStats] = {}
        self.global_stats: Dict[str, int] = {}
        self._last_event_count = 0
        self._last_poll_ns  = 0

        # Prometheus counters
        if PROMETHEUS_AVAILABLE:
            self._prom_packets  = Counter("agentguard_packets_total",
                                          "Total packets seen", ["verdict"])
            self._prom_threats  = Counter("agentguard_threats_total",
                                          "Threat events", ["type"])
            self._prom_agents   = Gauge("agentguard_agents_active",
                                        "Active agent count")
            self._prom_bps      = Gauge("agentguard_bytes_per_sec",
                                        "Aggregate outbound B/s")

    def start(self):
        self.running = True
        t = threading.Thread(target=self._poll_loop, daemon=True)
        t.start()

    def _poll_loop(self):
        while self.running:
            try:
                self._fetch_events()
                self._fetch_stats()
                self._fetch_agents()
                self.connected = True
            except Exception as e:
                self.connected = False
            time.sleep(POLL_INTERVAL)

    def _fetch_events(self):
        resp = requests.get(f"{self.url}/api/events?limit=200", timeout=2)
        raw_events = resp.json().get("events", [])
        with self._lock:
            new_count = len(raw_events)
            # Only add truly new events (avoid duplicates on re-poll)
            if new_count > self._last_event_count:
                for raw in raw_events[self._last_event_count:]:
                    evt = EventRecord(raw)
                    self.events.append(evt)
                    self._update_agent_from_event(evt)
                    if PROMETHEUS_AVAILABLE:
                        try:
                            self._prom_packets.labels(verdict=evt.verdict).inc()
                            if evt.is_threat():
                                self._prom_threats.labels(type=evt.event).inc()
                        except Exception:
                            pass
            self._last_event_count = new_count

    def _fetch_stats(self):
        resp = requests.get(f"{self.url}/api/stats", timeout=2)
        with self._lock:
            self.global_stats = resp.json()

    def _fetch_agents(self):
        resp = requests.get(f"{self.url}/api/agents", timeout=2)
        data = resp.json().get("agents", [])
        with self._lock:
            for a in data:
                pid = a["pid"]
                if pid not in self.agents:
                    self.agents[pid] = AgentStats(pid, a["name"])
                self.agents[pid].last_seen = time.time()
            if PROMETHEUS_AVAILABLE:
                try:
                    self._prom_agents.set(len(self.agents))
                except Exception:
                    pass

    def _update_agent_from_event(self, evt: EventRecord):
        pid = evt.pid
        if pid not in self.agents:
            self.agents[pid] = AgentStats(pid, evt.comm)
        a = self.agents[pid]
        a.last_seen = time.time()
        a.threat_level = max(a.threat_level, evt.threat_level)
        if ":" in evt.dst:
            a.packets_out += 1
            a.bytes_out   += evt.size
        else:
            a.packets_in  += 1
            a.bytes_in    += evt.size
        if evt.verdict in ("block", "kill"):
            a.blocked += 1
        if evt.event == "prompt_injection":
            a.injections += 1
        if evt.event == "dangerous_syscall":
            a.syscall_blocks += 1
        a.tick_rates()

    def get_events_snapshot(self) -> List[EventRecord]:
        with self._lock:
            return list(self.events)

    def get_agents_snapshot(self) -> List[AgentStats]:
        with self._lock:
            return sorted(self.agents.values(),
                          key=lambda a: a.last_seen, reverse=True)

    def get_stats_snapshot(self) -> dict:
        with self._lock:
            return dict(self.global_stats)

    def get_threat_events(self) -> List[EventRecord]:
        with self._lock:
            return [e for e in self.events if e.is_threat()]

# ─────────────────────────────────────────────────────────────────────────────
# Rich TUI Dashboard
# ─────────────────────────────────────────────────────────────────────────────

def fmt_bytes(n: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if n < 1024:
            return f"{n:.1f}{unit}"
        n /= 1024
    return f"{n:.1f}TB"

def fmt_bps(bps: float) -> str:
    return fmt_bytes(int(bps)) + "/s"

def build_header(collector: DataCollector, uptime_start: float) -> Panel:
    stats = collector.get_stats_snapshot()
    agents = collector.get_agents_snapshot()
    uptime = str(timedelta(seconds=int(time.time() - uptime_start)))

    status_color = "green" if collector.connected else "red"
    status_icon  = "●" if collector.connected else "○"

    threat_agents = sum(1 for a in agents if a.threat_level > 0)
    critical_agents = sum(1 for a in agents if a.threat_level >= 4)

    cols = Columns([
        Text.assemble(
            (f" {status_icon} ", status_color),
            ("AgentGuard", "bold white"),
            (" LIVE", "bold green" if collector.connected else "bold red"),
        ),
        Text.assemble(
            ("Agents: ", "dim"), (str(len(agents)), "bold cyan"),
        ),
        Text.assemble(
            ("Threats: ", "dim"),
            (str(threat_agents), "bold yellow" if threat_agents else "dim"),
        ),
        Text.assemble(
            ("Critical: ", "dim"),
            (str(critical_agents), "bold red" if critical_agents else "dim"),
        ),
        Text.assemble(
            ("Blocked: ", "dim"),
            (str(stats.get("packets_blocked", 0)), "bold red"),
        ),
        Text.assemble(
            ("Injections: ", "dim"),
            (str(stats.get("injections_found", 0)), "bold magenta"),
        ),
        Text.assemble(
            ("Kills: ", "dim"),
            (str(stats.get("kills_issued", 0)), "bold red"),
        ),
        Text.assemble(
            ("Uptime: ", "dim"), (uptime, "white"),
        ),
    ], equal=True)

    return Panel(cols, style="on grey7", border_style="grey30", height=3)


def build_agents_table(agents: List[AgentStats]) -> Table:
    t = Table(
        box=box.SIMPLE_HEAD,
        show_header=True,
        header_style="bold white on grey15",
        border_style="grey30",
        expand=True,
        title="[bold white]Active Agents[/]",
        title_justify="left",
    )
    t.add_column("PID",     style="dim",    width=8,  no_wrap=True)
    t.add_column("Agent",   style="white",  width=22, no_wrap=True)
    t.add_column("Policy",  style="dim",    width=12, no_wrap=True)
    t.add_column("Threat",  width=10, no_wrap=True)
    t.add_column("Out",     justify="right",width=10, no_wrap=True)
    t.add_column("In",      justify="right",width=10, no_wrap=True)
    t.add_column("Blocked", justify="right",width=9,  no_wrap=True)
    t.add_column("Inj",     justify="right",width=6,  no_wrap=True)
    t.add_column("B/s",     justify="right",width=10, no_wrap=True)

    for a in agents[:15]:  # max 15 rows to fit screen
        threat_text = Text(f"{'▲ ' if a.threat_level > 0 else ''}{a.threat_label}",
                           style=a.threat_color)
        blocked_text = Text(str(a.blocked),
                            style="bold red" if a.blocked > 0 else "dim")
        inj_text = Text(str(a.injections),
                        style="bold magenta" if a.injections > 0 else "dim")
        t.add_row(
            str(a.pid),
            a.name[:22],
            a.policy,
            threat_text,
            fmt_bytes(a.bytes_out),
            fmt_bytes(a.bytes_in),
            blocked_text,
            inj_text,
            fmt_bps(a.avg_bps),
        )
    return t


def build_events_table(events: List[EventRecord], threat_only: bool = False) -> Table:
    t = Table(
        box=box.SIMPLE_HEAD,
        show_header=True,
        header_style="bold white on grey15",
        border_style="grey30",
        expand=True,
        title="[bold white]Event Stream[/]" if not threat_only
              else "[bold red]Threat Events[/]",
        title_justify="left",
    )
    t.add_column("Time",    style="dim",   width=13, no_wrap=True)
    t.add_column("",        width=2,       no_wrap=True)      # icon
    t.add_column("Event",   width=18,      no_wrap=True)
    t.add_column("PID",     style="dim",   width=7,  no_wrap=True)
    t.add_column("Comm",    width=14,      no_wrap=True)
    t.add_column("Src → Dst", width=36,   no_wrap=True)
    t.add_column("Size",    justify="right",width=8, no_wrap=True)
    t.add_column("Verdict", width=8,       no_wrap=True)
    t.add_column("Detail",  width=24)

    display = [e for e in reversed(events) if not threat_only or e.is_threat()][:25]

    for e in display:
        verdict_text = Text(e.verdict.upper()[:7],
                            style=f"bold {e.verdict_color}")

        detail = ""
        if e.event == "prompt_injection":
            detail = f"score={e.injection_score}"
            if e.payload_sample:
                detail += f" {e.payload_sample[:12]}…"
        elif e.event == "dangerous_syscall":
            detail = e.syscall or ""
        elif e.event in ("data_exfil", "c2_detected"):
            detail = e.dst

        event_color = {
            "policy_block": "red", "prompt_injection": "magenta",
            "data_exfil": "orange1", "dangerous_syscall": "bold red",
            "c2_detected": "bold red", "agent_kill": "bold red",
            "sandbox_redirect": "yellow", "rate_limit": "cyan",
        }.get(e.event, "white")

        t.add_row(
            e.dt,
            e.icon,
            Text(e.event, style=event_color),
            str(e.pid),
            e.comm[:14],
            f"{e.src} → {e.dst}"[:36],
            fmt_bytes(e.size),
            verdict_text,
            detail[:24],
        )
    return t


def build_spark(values: List[float], width: int = 20) -> str:
    """ASCII sparkline for bandwidth history."""
    if not values:
        return " " * width
    chars = "▁▂▃▄▅▆▇█"
    mn, mx = min(values), max(values)
    rng = mx - mn or 1
    bar = ""
    step = max(1, len(values) // width)
    for i in range(0, len(values), step):
        v = values[i]
        idx = int((v - mn) / rng * (len(chars) - 1))
        bar += chars[idx]
    return bar[-width:].ljust(width)


def run_dashboard(collector: DataCollector, uptime_start: float):
    """Main TUI loop using Rich Live."""
    console = Console()

    def make_layout() -> Layout:
        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
        )
        layout["body"].split_row(
            Layout(name="left",  ratio=2),
            Layout(name="right", ratio=3),
        )
        layout["left"].split_column(
            Layout(name="agents"),
            Layout(name="bw",    size=7),
        )
        layout["right"].split_column(
            Layout(name="events"),
            Layout(name="threats", size=14),
        )
        return layout

    layout = make_layout()

    with Live(layout, refresh_per_second=2, screen=True, console=console):
        while True:
            agents = collector.get_agents_snapshot()
            events = collector.get_events_snapshot()
            threats = collector.get_threat_events()

            # Header
            layout["header"].update(build_header(collector, uptime_start))

            # Agents table
            layout["agents"].update(
                Panel(build_agents_table(agents),
                      border_style="grey23", padding=(0, 0))
            )

            # Bandwidth sparklines per agent
            bw_table = Table(box=box.SIMPLE, show_header=False,
                             expand=True, border_style="grey23")
            bw_table.add_column("Agent", style="dim", width=20)
            bw_table.add_column("Sparkline", width=22)
            bw_table.add_column("B/s", justify="right", width=10)
            for a in agents[:5]:
                spark = build_spark(list(a._bps_window))
                bw_table.add_row(
                    a.name[:20],
                    Text(spark, style="cyan"),
                    fmt_bps(a.avg_bps),
                )
            layout["bw"].update(
                Panel(bw_table, title="[dim]Bandwidth (60s)[/]",
                      border_style="grey23", padding=(0, 0))
            )

            # Event stream
            layout["events"].update(
                Panel(build_events_table(events),
                      border_style="grey23", padding=(0, 0))
            )

            # Threat events
            layout["threats"].update(
                Panel(build_events_table(threats, threat_only=True),
                      border_style="red", padding=(0, 0))
            )

            time.sleep(POLL_INTERVAL)


# ─────────────────────────────────────────────────────────────────────────────
# Raw event stream (non-TUI)
# ─────────────────────────────────────────────────────────────────────────────

def run_stream(collector: DataCollector, threat_only: bool = False):
    """Print events as they arrive, one line each."""
    console = Console()
    seen = set()

    console.print("[bold cyan]AgentGuard[/] [green]LIVE STREAM[/] "
                  f"— connected to {DAEMON_URL}")
    console.print("[dim]Ctrl+C to stop[/]\n")

    while True:
        for evt in collector.get_events_snapshot():
            key = (evt.ts, evt.pid, evt.event)
            if key in seen:
                continue
            seen.add(key)
            if threat_only and not evt.is_threat():
                continue

            color = {
                "allow": "green", "block": "red", "sandbox": "yellow",
                "kill": "bold red", "audit": "cyan",
            }.get(evt.verdict, "white")

            console.print(
                f"[dim]{evt.dt}[/]  "
                f"[{color}]{evt.verdict.upper():<7}[/]  "
                f"{evt.icon} [white]{evt.event:<22}[/]  "
                f"[dim]{evt.comm:<14}[/]  "
                f"{evt.src} → {evt.dst}  "
                f"[dim]{fmt_bytes(evt.size)}[/]"
                + (f"  [magenta]injection_score={evt.injection_score}[/]"
                   if evt.injection_score else "")
                + (f"  [red]syscall={evt.syscall}[/]"
                   if evt.syscall else "")
            )
        time.sleep(0.2)


# ─────────────────────────────────────────────────────────────────────────────
# Report generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_report(collector: DataCollector, output_path: str, fmt: str = "json"):
    events = collector.get_events_snapshot()
    agents = collector.get_agents_snapshot()
    stats  = collector.get_stats_snapshot()

    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "daemon":        DAEMON_URL,
        "summary": {
            "total_events":      len(events),
            "threat_events":     sum(1 for e in events if e.is_threat()),
            "blocked_packets":   stats.get("packets_blocked", 0),
            "injections_found":  stats.get("injections_found", 0),
            "kills_issued":      stats.get("kills_issued", 0),
            "active_agents":     len(agents),
        },
        "agents": [
            {
                "pid":            a.pid,
                "name":           a.name,
                "policy":         a.policy,
                "threat_level":   a.threat_level,
                "threat_label":   a.threat_label,
                "bytes_out":      a.bytes_out,
                "bytes_in":       a.bytes_in,
                "blocked":        a.blocked,
                "injections":     a.injections,
                "syscall_blocks": a.syscall_blocks,
            }
            for a in agents
        ],
        "threat_events": [
            {
                "ts":             e.ts,
                "time":           e.dt,
                "event":          e.event,
                "pid":            e.pid,
                "comm":           e.comm,
                "src":            e.src,
                "dst":            e.dst,
                "verdict":        e.verdict,
                "threat_level":   e.threat_level,
                "injection_score":e.injection_score,
                "syscall":        e.syscall,
            }
            for e in events if e.is_threat()
        ],
    }

    if fmt == "json":
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2)
        print(f"[✓] Report written to {output_path}")

    elif fmt == "csv":
        import csv
        with open(output_path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=[
                "time", "event", "pid", "comm", "src", "dst",
                "verdict", "threat_level", "injection_score", "syscall",
            ])
            w.writeheader()
            for e in report["threat_events"]:
                w.writerow({k: e.get(k, "") for k in w.fieldnames})
        print(f"[✓] CSV written to {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="AgentGuard observability CLI")
    parser.add_argument("--url",          default=DAEMON_URL,
                        help="AgentGuard daemon URL (default: $AGENTGUARD_URL or localhost:8080)")
    parser.add_argument("--stream",       action="store_true",
                        help="Raw event stream (no TUI)")
    parser.add_argument("--threats-only", action="store_true",
                        help="Show only threat events in stream mode")
    parser.add_argument("--report",       action="store_true",
                        help="Generate and save a report, then exit")
    parser.add_argument("--out",          default="agentguard_report.json",
                        help="Report output path")
    parser.add_argument("--format",       choices=["json", "csv"], default="json",
                        help="Report format")
    parser.add_argument("--tail",         type=int, default=0,
                        help="Print last N events and exit (no TUI)")
    parser.add_argument("--metrics-port", type=int, default=0,
                        help="Start Prometheus metrics server on this port")
    args = parser.parse_args()

    global DAEMON_URL
    DAEMON_URL = args.url

    collector = DataCollector(daemon_url=args.url)
    collector.start()

    # Give collector a moment to connect
    time.sleep(1.2)

    if args.metrics_port and PROMETHEUS_AVAILABLE:
        start_http_server(args.metrics_port)
        print(f"[✓] Prometheus metrics at http://localhost:{args.metrics_port}/metrics")

    if args.report:
        time.sleep(2)   # let collector gather data
        generate_report(collector, args.out, args.format)
        return

    if args.tail:
        events = list(collector.get_events_snapshot())[-args.tail:]
        console = Console()
        for e in events:
            color = {"allow":"green","block":"red","kill":"bold red"}.get(e.verdict,"white")
            console.print(f"[dim]{e.dt}[/] [{color}]{e.verdict.upper():<7}[/] "
                          f"{e.icon} {e.event:<22} "
                          f"[dim]{e.comm:<14}[/] {e.src}→{e.dst}")
        return

    if args.stream or not RICH_AVAILABLE:
        try:
            run_stream(collector, threat_only=args.threats_only)
        except KeyboardInterrupt:
            pass
        return

    # Full TUI dashboard
    uptime_start = time.time()
    try:
        run_dashboard(collector, uptime_start)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main()
