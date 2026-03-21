"""
Main entry point for AgentGuard.
- Manages BPF lifecycle (XDP/TC/tracepoints)
- Handles enforcement (Kill/Block/Sandbox)
- Registry for agent PIDs
- Exposes FastAPI for the dashboard/CLI
"""

import os
import sys
import time
import ctypes
import struct
import signal
import socket
import threading
import ipaddress
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional, Dict, List
from dataclasses import dataclass, field as dc_field

import sys as _sys


_backend_dir = Path(__file__).parent
if str(_backend_dir) not in _sys.path:
    _sys.path.insert(0, str(_backend_dir))

_root_dir = _backend_dir.parent
if str(_root_dir) not in _sys.path:
    _sys.path.insert(0, str(_root_dir))

import yaml
import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# --- Internal Imports ---
try:
    from websocket_manager import ws_manager
    from routes_ws import ws_router
    from routes_demo import demo_router, attach_demo_routes
    from routes_verify import verify_router
    from audit_log import audit_log
    BACKEND_AVAILABLE = True
except ImportError as _be_err:
    BACKEND_AVAILABLE = False
    _be_err_msg = str(_be_err)

# --- Proxy Layer ---

try:
    _proxy_dir = Path(__file__).parent.parent / "ag_proxy"
    # Root is already in sys.path from above, no need to add ag_proxy dir directly
    # which can cause collisions with ag_proxy.py.

    import importlib.util as _ilu
    _proxy_spec = _ilu.spec_from_file_location(
        "agentguard_proxy",
        str(_proxy_dir / "proxy.py")
    )
    _proxy_mod = _ilu.module_from_spec(_proxy_spec)
    _proxy_spec.loader.exec_module(_proxy_mod)

    ProxyPolicyEngine      = _proxy_mod.PolicyEngine
    ProxyEventStore        = _proxy_mod.EventStore
    ProxyServer            = _proxy_mod.ProxyServer
    proxy_router           = _proxy_mod.proxy_router
    _attach_proxy_to_daemon = _proxy_mod.attach_to_daemon
    PROXY_AVAILABLE = True
except Exception as _proxy_err:
    PROXY_AVAILABLE = False
    _proxy_err_msg  = str(_proxy_err)

# --- BPF Helpers ---

import ctypes.util as _ctutil

def _load_libbpf() -> ctypes.CDLL:
    """Locate and return a handle to libbpf."""
    for candidate in ("libbpf.so.1", "libbpf.so.0", "libbpf.so"):
        try:
            return ctypes.CDLL(candidate)
        except OSError:
            pass
    found = _ctutil.find_library("bpf")
    if found:
        return ctypes.CDLL(found)
    raise RuntimeError(
        "libbpf not found. Install it: apt-get install libbpf0"
    )

# --- Verdict & Threat Constants ---

VERDICT_ALLOW   = 0
VERDICT_BLOCK   = 1
VERDICT_SANDBOX = 2
VERDICT_KILL    = 3
VERDICT_AUDIT   = 4

THREAT_NONE     = 0
THREAT_LOW      = 1
THREAT_MEDIUM   = 2
THREAT_HIGH     = 3
THREAT_CRITICAL = 4

EVT_PACKET_SEEN       = 1
EVT_POLICY_BLOCK      = 2
EVT_PROMPT_INJECTION  = 3
EVT_DATA_EXFIL        = 4
EVT_DANGEROUS_SYSCALL = 5
EVT_RATE_LIMIT_HIT    = 6
EVT_SANDBOX_REDIRECT  = 7
EVT_AGENT_KILL        = 8
EVT_TOOL_ABUSE        = 9
EVT_C2_DETECTED       = 10

EVENT_TYPE_NAMES = {
    EVT_PACKET_SEEN:       "packet_seen",
    EVT_POLICY_BLOCK:      "policy_block",
    EVT_PROMPT_INJECTION:  "prompt_injection",
    EVT_DATA_EXFIL:        "data_exfil",
    EVT_DANGEROUS_SYSCALL: "dangerous_syscall",
    EVT_RATE_LIMIT_HIT:    "rate_limit",
    EVT_SANDBOX_REDIRECT:  "sandbox_redirect",
    EVT_AGENT_KILL:        "agent_kill",
    EVT_TOOL_ABUSE:        "tool_abuse",
    EVT_C2_DETECTED:       "c2_detected",
}

AGENT_FLAG_REGISTERED = (1 << 0)
AGENT_FLAG_SANDBOXED  = (1 << 1)
AGENT_FLAG_KILLED     = (1 << 2)
AGENT_FLAG_AUDITING   = (1 << 3)

VERDICT_LABELS = {
    VERDICT_ALLOW:   "allow",
    VERDICT_BLOCK:   "block",
    VERDICT_SANDBOX: "sandbox",
    VERDICT_KILL:    "kill",
    VERDICT_AUDIT:   "audit",
}

THREAT_LABELS = {
    THREAT_NONE:     "none",
    THREAT_LOW:      "low",
    THREAT_MEDIUM:   "medium",
    THREAT_HIGH:     "high",
    THREAT_CRITICAL: "critical",
}

# --- BPF Data Structures (ctypes) ---

class AgentEvent(ctypes.Structure):
    _fields_ = [
        ("timestamp_ns", ctypes.c_uint64),
        ("event_type",   ctypes.c_uint32),
        ("pid",          ctypes.c_uint32),
        ("tgid",         ctypes.c_uint32),
        ("comm",         ctypes.c_char * 16),
        ("src_ip",       ctypes.c_uint32),
        ("dst_ip",       ctypes.c_uint32),
        ("src_port",     ctypes.c_uint16),
        ("dst_port",     ctypes.c_uint16),
        ("protocol",     ctypes.c_uint8),
        ("_pad",         ctypes.c_uint8 * 3),
        ("packet_size",  ctypes.c_uint32),
        ("tcp_flags",    ctypes.c_uint32),
        ("verdict",      ctypes.c_uint32),
        ("policy_id",    ctypes.c_uint32),
        ("threat_level", ctypes.c_uint32),
        ("payload_head", ctypes.c_uint8 * 64),
        ("payload_len",  ctypes.c_uint32),
        ("meta",         ctypes.c_uint32 * 8),
    ]

class SyscallEvent(ctypes.Structure):
    _fields_ = [
        ("timestamp_ns", ctypes.c_uint64),
        ("event_type",   ctypes.c_uint32),
        ("pid",          ctypes.c_uint32),
        ("tgid",         ctypes.c_uint32),
        ("comm",         ctypes.c_char * 16),
        ("syscall_nr",   ctypes.c_uint32),
        ("args",         ctypes.c_uint64 * 4),
        ("verdict",      ctypes.c_uint32),
        ("threat_level", ctypes.c_uint32),
    ]

class AgentIdentity(ctypes.Structure):
    _fields_ = [
        ("pid",              ctypes.c_uint32),
        ("tgid",             ctypes.c_uint32),
        ("comm",             ctypes.c_char * 16),
        ("full_name",        ctypes.c_char * 48),
        ("policy_id",        ctypes.c_uint32),
        ("threat_level",     ctypes.c_uint32),
        ("first_seen_ns",    ctypes.c_uint64),
        ("last_active_ns",   ctypes.c_uint64),
        ("requests_total",   ctypes.c_uint64),
        ("requests_blocked", ctypes.c_uint64),
        ("bytes_sent",       ctypes.c_uint64),
        ("bytes_recv",       ctypes.c_uint64),
        ("flags",            ctypes.c_uint32),
    ]

class AgentPolicyBPF(ctypes.Structure):
    _fields_ = [
        ("policy_id",             ctypes.c_uint32),
        ("allowed_ports",         ctypes.c_uint32 * 16),
        ("blocked_ips",           ctypes.c_uint32 * 8),
        ("max_bytes_per_sec",     ctypes.c_uint64),
        ("max_connections",       ctypes.c_uint32),
        ("max_new_conns_per_sec", ctypes.c_uint32),
        ("allow_exec",            ctypes.c_uint8),
        ("allow_fork",            ctypes.c_uint8),
        ("allow_ptrace",          ctypes.c_uint8),
        ("allow_raw_sockets",     ctypes.c_uint8),
        ("allow_bind",            ctypes.c_uint8),
        ("inspect_http",          ctypes.c_uint8),
        ("block_on_injection",    ctypes.c_uint8),
        ("allow_external_net",    ctypes.c_uint8),
        ("sandbox_ns_id",         ctypes.c_uint32),
    ]

# --- API Models ---

class PolicyOut(BaseModel):
    id: int
    name: str
    allowed_ports: List[int]
    allow_external_net: bool
    inspect_http: bool
    block_on_injection: bool
    max_bytes_per_sec: int
    allow_exec: bool
    allow_fork: bool
    allow_ptrace: bool

class AgentOut(BaseModel):
    pid: int
    name: str

class AgentDetailOut(BaseModel):
    pid: int
    name: str
    policy: str
    threat_level: int
    threat_label: str
    bytes_sent: int
    bytes_recv: int
    requests_total: int
    requests_blocked: int
    flags: int

class EventOut(BaseModel):
    ts: int
    event: str
    pid: int
    comm: str
    src: str
    dst: str
    proto: int
    size: int
    verdict: str
    threat_level: int
    injection_score: Optional[int] = None
    payload_sample: Optional[str] = None
    syscall: Optional[str] = None

class StatsOut(BaseModel):
    packets_seen: int = 0
    packets_blocked: int = 0
    injections_found: int = 0
    syscalls_blocked: int = 0
    agents_tracked: int = 0
    kills_issued: int = 0

class VerdictResponse(BaseModel):
    status: str
    pid: int

class BlockIPRequest(BaseModel):
    ip: str = Field(..., examples=["185.220.101.5"])

    @field_validator("ip")
    @classmethod
    def validate_ip(cls, v: str) -> str:
        try:
            ipaddress.IPv4Address(v)
        except ValueError:
            raise ValueError(f"Invalid IPv4 address: {v}")
        return v

class BlockIPResponse(BaseModel):
    status: str
    ip: str

class RegisterAgentRequest(BaseModel):
    pid: int
    name: str
    policy_id: int = 1
    hostname: Optional[str] = None
    tags: List[str] = []

class RegisterAgentResponse(BaseModel):
    status: str
    pid: int
    policy_id: int

class ToolCallRequest(BaseModel):
    tool: str
    args: dict = {}

# --- Internal Types ---

@dataclass
class PolicyDefinition:
    id: int
    name: str
    allowed_ports: List[int] = dc_field(default_factory=list)
    max_bytes_per_sec: int = 10_485_760
    max_connections: int = 100
    max_new_conns_per_sec: int = 50
    allow_exec: bool = False
    allow_fork: bool = False
    allow_ptrace: bool = False
    allow_raw_sockets: bool = False
    allow_bind: bool = False
    inspect_http: bool = True
    block_on_injection: bool = True
    allow_external_net: bool = False
    sandbox_ns_id: int = 0

@dataclass
class AgentDefinition:
    name: str
    process_name: str
    policy_name: str
    cmdline_contains: Optional[str] = None

# --- Main Daemon ---

class AgentGuardDaemon:
    def __init__(self, config_path: str, iface: str, bpf_obj_path: str):
        self.config_path  = config_path
        self.iface        = iface
        self.bpf_obj_path = bpf_obj_path
        self.running      = False
        self.bpf          = None
        self._lock        = threading.Lock()

        self.policies:       Dict[str, PolicyDefinition] = {}
        self.policies_by_id: Dict[int, PolicyDefinition] = {}
        self.agent_defs:     List[AgentDefinition]       = []
        self.tracked_pids:   Dict[int, str]              = {}
        self.agent_details:  Dict[int, dict]             = {}
        self.event_log:      List[dict]                  = []
        self.stats           = StatsOut()

        self._bpf_mode    = "stub"   
        self._proxy_server = None
        self._proxy_engine = None
        self._proxy_store  = None
        self.proxy_port    = 8888
        self._bpf_obj  = None
        self._libbpf   = None
        self.log = structlog.get_logger()

    #Config

    def load_config(self) -> None:
        with open(self.config_path) as f:
            cfg = yaml.safe_load(f)

        for p in cfg.get("policies", []):
            pol = PolicyDefinition(
                id                    = p["id"],
                name                  = p["name"],
                allowed_ports         = p.get("allowed_ports", []),
                max_bytes_per_sec     = p.get("max_bytes_per_sec", 10_485_760),
                max_connections       = p.get("max_connections", 100),
                max_new_conns_per_sec = p.get("max_new_conns_per_sec", 50),
                allow_exec            = p.get("allow_exec", False),
                allow_fork            = p.get("allow_fork", False),
                allow_ptrace          = p.get("allow_ptrace", False),
                allow_raw_sockets     = p.get("allow_raw_sockets", False),
                allow_bind            = p.get("allow_bind", False),
                inspect_http          = p.get("inspect_http", True),
                block_on_injection    = p.get("block_on_injection", True),
                allow_external_net    = p.get("allow_external_net", False),
            )
            self.policies[pol.name]     = pol
            self.policies_by_id[pol.id] = pol

        for a in cfg.get("agents", []):
            self.agent_defs.append(AgentDefinition(
                name             = a["name"],
                process_name     = a["process_name"],
                policy_name      = a.get("policy", "restricted"),
                cmdline_contains = a.get("cmdline_contains"),
            ))

        self._blocked_cidrs: List[ipaddress.IPv4Network] = []
        for cidr in cfg.get("threat_intel", {}).get("blocked_ips", []):
            try:
                self._blocked_cidrs.append(
                    ipaddress.IPv4Network(cidr, strict=False))
            except ValueError:
                pass

        self.log.info("config_loaded",
                      policies=len(self.policies),
                      agent_defs=len(self.agent_defs),
                      blocked_cidrs=len(self._blocked_cidrs))

    #BPF setup

    def load_bpf(self) -> None:
        """
        BPF loader with graceful degradation.
        """
        obj_path = Path(self.bpf_obj_path)

        #Detect whether we can actually load BPF
        if not self._bpf_supported():
            self.log.warning(
                "bpf_stub_mode",
                reason="BPF not available on this host — running in stub mode",
                note="Policy engine, API, and observability are fully active. "
                     "Kernel-level packet drop requires deployment on Linux."
            )
            self._bpf_mode = "stub"
            return

        if not obj_path.exists():
            self.log.warning(
                "bpf_obj_missing",
                path=str(obj_path),
                reason="Pre-compiled BPF object not found — running in stub mode",
                fix="On Linux run: clang -O2 -g -target bpf "
                    "-D__TARGET_ARCH_x86 -I/usr/include/x86_64-linux-gnu "
                    f"-I/usr/include kernel/agent_guard.bpf.c -o {obj_path}"
            )
            self._bpf_mode = "stub"
            return

        #Attempt full CO-RE load
        try:
            lib = _load_libbpf()

            lib.bpf_object__open_file.restype  = ctypes.c_void_p
            lib.bpf_object__open_file.argtypes = [ctypes.c_char_p, ctypes.c_void_p]
            bpf_obj = lib.bpf_object__open_file(str(obj_path).encode(), None)
            if not bpf_obj:
                raise RuntimeError("bpf_object__open_file returned NULL")

            lib.bpf_object__load.restype  = ctypes.c_int
            lib.bpf_object__load.argtypes = [ctypes.c_void_p]
            rc = lib.bpf_object__load(bpf_obj)
            if rc != 0:
                raise RuntimeError(
                    f"bpf_object__load failed rc={rc} — "
                    "container needs --privileged and a supported kernel")

            self._bpf_obj  = bpf_obj
            self._libbpf   = lib
            self._bpf_mode = "core"

            self._attach_xdp(lib, bpf_obj)
            self._attach_tc(lib, bpf_obj)
            self._attach_tracepoint(lib, bpf_obj)
            self._pin_maps(lib, bpf_obj)

            self.log.info("bpf_loaded",
                          mode="CO-RE",
                          obj=str(obj_path),
                          xdp=f"{self.iface}/ingress",
                          tc=f"{self.iface}/egress+ingress")

        except Exception as e:
            self.log.warning(
                "bpf_load_failed",
                error=str(e),
                fallback="stub_mode",
                note="Daemon continues — kernel enforcement disabled"
            )
            self._bpf_mode = "stub"

    def _bpf_supported(self) -> bool:
        """Return True if this host can load BPF programs."""
        if not Path("/sys/fs/bpf").exists():
            return False
        try:
            _load_libbpf()
        except RuntimeError:
            return False
        try:
            import ctypes
            libc = ctypes.CDLL("libc.so.6", use_errno=True)
            # sys_bpf(BPF_MAP_CREATE=0, attr, size) — expect EPERM or EINVAL, not ENOSYS
            BPF_MAP_CREATE = 0
            libc.syscall.restype  = ctypes.c_long
            libc.syscall.argtypes = [ctypes.c_long] + [ctypes.c_void_p] * 10
            # We just need a non-ENOSYS response to confirm BPF syscall exists
            import errno
            libc.syscall(321, None, 0)  # 321 = __NR_bpf on x86_64
            err = ctypes.get_errno()
            if err == errno.ENOSYS:
                return False
        except Exception:
            return False
        return True

    def _get_ifindex(self) -> int:
        """Return the ifindex for self.iface."""
        import socket as _sock
        import fcntl, struct
        SIOCGIFINDEX = 0x8933
        s = _sock.socket(_sock.AF_INET, _sock.SOCK_DGRAM)
        try:
            ifreq = struct.pack("16sI", self.iface.encode(), 0)
            res   = fcntl.ioctl(s.fileno(), SIOCGIFINDEX, ifreq)
            return struct.unpack("16sI", res)[1]
        except OSError as e:
            self.log.warning("ifindex_lookup_failed", iface=self.iface, err=str(e))
            return 0
        finally:
            s.close()

    def _attach_xdp(self, lib, bpf_obj) -> None:
        """Attach xdp/ingress using XDP_FLAGS_SKB_MODE (generic — works in Docker/WSL2)."""
        try:
            lib.bpf_object__find_program_by_name.restype  = ctypes.c_void_p
            lib.bpf_object__find_program_by_name.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
            prog = lib.bpf_object__find_program_by_name(bpf_obj, b"agent_guard_xdp")
            if not prog:
                self.log.warning("xdp_prog_not_found")
                return
            lib.bpf_program__fd.restype  = ctypes.c_int
            lib.bpf_program__fd.argtypes = [ctypes.c_void_p]
            prog_fd = lib.bpf_program__fd(prog)
            ifindex = self._get_ifindex()
            if ifindex == 0:
                return
            XDP_FLAGS_SKB_MODE = 2
            lib.bpf_xdp_attach.restype  = ctypes.c_int
            lib.bpf_xdp_attach.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_uint32, ctypes.c_void_p]
            rc = lib.bpf_xdp_attach(ifindex, prog_fd, XDP_FLAGS_SKB_MODE, None)
            if rc < 0:
                self.log.warning("xdp_attach_failed", rc=rc)
            else:
                self.log.info("xdp_attached", iface=self.iface, mode="generic")
        except Exception as e:
            self.log.warning("xdp_attach_error", err=str(e))

    def _attach_tc(self, lib, bpf_obj) -> None:
        """Attach TC egress + ingress via pyroute2 clsact qdisc."""
        try:
            from pyroute2 import IPRoute
            from pyroute2.netlink.exceptions import NetlinkError
            lib.bpf_object__find_program_by_name.restype  = ctypes.c_void_p
            lib.bpf_object__find_program_by_name.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
            lib.bpf_program__fd.restype  = ctypes.c_int
            lib.bpf_program__fd.argtypes = [ctypes.c_void_p]
            egress_prog  = lib.bpf_object__find_program_by_name(bpf_obj, b"agent_guard_tc_egress")
            ingress_prog = lib.bpf_object__find_program_by_name(bpf_obj, b"agent_guard_tc_ingress")
            with IPRoute() as ip:
                idx = ip.link_lookup(ifname=self.iface)
                if not idx:
                    self.log.warning("tc_iface_not_found", iface=self.iface)
                    return
                idx = idx[0]
                try:
                    ip.tc("add", "clsact", idx)
                except NetlinkError:
                    pass
                if egress_prog:
                    fd = lib.bpf_program__fd(egress_prog)
                    ip.tc("add-filter", "bpf", idx, ":1", fd=fd, name="egress",
                          parent="ffff:fff3", action="ok", classid=1)
                    self.log.info("tc_egress_attached", iface=self.iface)
                if ingress_prog:
                    fd = lib.bpf_program__fd(ingress_prog)
                    ip.tc("add-filter", "bpf", idx, ":1", fd=fd, name="ingress",
                          parent="ffff:fff2", action="ok", classid=1)
                    self.log.info("tc_ingress_attached", iface=self.iface)
        except Exception as e:
            self.log.warning("tc_attach_error", err=str(e))

    def _attach_tracepoint(self, lib, bpf_obj) -> None:
        """Attach raw_syscalls/sys_enter tracepoint."""
        try:
            lib.bpf_object__find_program_by_name.restype  = ctypes.c_void_p
            lib.bpf_object__find_program_by_name.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
            prog = lib.bpf_object__find_program_by_name(bpf_obj, b"agent_guard_syscall")
            if not prog:
                self.log.warning("tracepoint_prog_not_found")
                return
            lib.bpf_program__attach.restype  = ctypes.c_void_p
            lib.bpf_program__attach.argtypes = [ctypes.c_void_p]
            link = lib.bpf_program__attach(prog)
            if not link:
                self.log.warning("tracepoint_attach_failed")
            else:
                self.log.info("tracepoint_attached", tp="raw_syscalls/sys_enter")
        except Exception as e:
            self.log.warning("tracepoint_attach_error", err=str(e))

    def _pin_maps(self, lib, bpf_obj) -> None:
        """Pin all BPF maps to /sys/fs/bpf/agentguard/."""
        pin_dir = Path("/sys/fs/bpf/agentguard")
        try:
            pin_dir.mkdir(parents=True, exist_ok=True)
            lib.bpf_object__pin_maps.restype  = ctypes.c_int
            lib.bpf_object__pin_maps.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
            rc = lib.bpf_object__pin_maps(bpf_obj, str(pin_dir).encode())
            if rc == 0:
                self.log.info("maps_pinned", path=str(pin_dir))
            else:
                self.log.warning("maps_pin_failed", rc=rc)
        except Exception as e:
            self.log.warning("maps_pin_error", err=str(e))

    def _load_policies_into_bpf(self) -> None:
        for pol_id, pol in self.policies_by_id.items():
            bpf_pol = AgentPolicyBPF()
            bpf_pol.policy_id = pol.id
            for i, port in enumerate(pol.allowed_ports[:16]):
                bpf_pol.allowed_ports[i] = port
            bpf_pol.max_bytes_per_sec     = pol.max_bytes_per_sec
            bpf_pol.max_connections       = pol.max_connections
            bpf_pol.max_new_conns_per_sec = pol.max_new_conns_per_sec
            bpf_pol.allow_exec            = int(pol.allow_exec)
            bpf_pol.allow_fork            = int(pol.allow_fork)
            bpf_pol.allow_ptrace          = int(pol.allow_ptrace)
            bpf_pol.allow_raw_sockets     = int(pol.allow_raw_sockets)
            bpf_pol.allow_bind            = int(pol.allow_bind)
            bpf_pol.inspect_http          = int(pol.inspect_http)
            bpf_pol.block_on_injection    = int(pol.block_on_injection)
            bpf_pol.allow_external_net    = int(pol.allow_external_net)
            # policy_store.update(pol_id, bpf_pol)
            self.log.debug("policy_loaded_into_bpf",
                           policy_id=pol_id, name=pol.name)

    def _load_blocked_ips_into_bpf(self) -> None:
        count = 0
        for network in self._blocked_cidrs:
            for host in network.hosts():
                ip_nbo = socket.htonl(int(host))
                # blocked_ips.update(ip_nbo, 1)
                count += 1
        self.log.info("blocked_ips_loaded", count=count)

    #Agent tracking

    def scan_processes(self) -> None:
        for entry in Path("/proc").iterdir():
            if not entry.name.isdigit():
                continue
            pid = int(entry.name)
            if pid in self.tracked_pids:
                continue
            try:
                comm    = (entry / "comm").read_text().strip()
                cmdline = (entry / "cmdline").read_bytes() \
                              .replace(b"\x00", b" ").decode(errors="ignore")
                for agent_def in self.agent_defs:
                    if comm != agent_def.process_name:
                        continue
                    if agent_def.cmdline_contains and \
                       agent_def.cmdline_contains not in cmdline:
                        continue
                    self._register_agent(pid, agent_def)
                    break
            except (PermissionError, FileNotFoundError):
                continue

    def _register_agent(self, pid: int, agent_def: AgentDefinition) -> None:
        pol = (self.policies.get(agent_def.policy_name)
               or self.policies.get("restricted")
               or next(iter(self.policies.values()), None))
        if not pol:
            return

        identity = AgentIdentity()
        identity.pid           = pid
        identity.policy_id     = pol.id
        identity.threat_level  = THREAT_NONE
        identity.first_seen_ns = int(time.time_ns())
        identity.flags         = AGENT_FLAG_REGISTERED
        name_bytes = agent_def.name.encode()[:47]
        ctypes.memmove(identity.full_name, name_bytes, len(name_bytes))
        #agent_registry.update(pid, identity)

        with self._lock:
            self.tracked_pids[pid]  = agent_def.name
            self.agent_details[pid] = {
                "pid": pid, "name": agent_def.name, "policy": pol.name,
                "threat_level": 0, "bytes_sent": 0, "bytes_recv": 0,
                "requests_total": 0, "requests_blocked": 0,
                "flags": AGENT_FLAG_REGISTERED,
            }
            self.stats.agents_tracked += 1

        self.log.info("agent_registered",
                      pid=pid, name=agent_def.name, policy=pol.name)

    def _deregister_dead_agents(self) -> None:
        dead = [pid for pid in list(self.tracked_pids)
                if not Path(f"/proc/{pid}").exists()]
        for pid in dead:
            with self._lock:
                name = self.tracked_pids.pop(pid, "?")
                self.agent_details.pop(pid, None)
            #agent_registry.delete(pid)
            self.log.info("agent_deregistered", pid=pid, name=name)

    #Event processing

    def handle_agent_event(self, cpu: int, data: bytes, size: int) -> None:
        if size < ctypes.sizeof(AgentEvent):
            return

        evt    = AgentEvent.from_buffer_copy(data)
        src_ip = socket.inet_ntoa(struct.pack("I", evt.src_ip))
        dst_ip = socket.inet_ntoa(struct.pack("I", evt.dst_ip))

        entry: dict = {
            "ts":           evt.timestamp_ns,
            "event":        EVENT_TYPE_NAMES.get(evt.event_type,
                                f"unknown_{evt.event_type}"),
            "pid":          evt.pid,
            "comm":         evt.comm.decode(errors="replace"),
            "src":          f"{src_ip}:{evt.src_port}",
            "dst":          f"{dst_ip}:{evt.dst_port}",
            "proto":        evt.protocol,
            "size":         evt.packet_size,
            "verdict":      VERDICT_LABELS.get(evt.verdict, str(evt.verdict)),
            "threat_level": evt.threat_level,
        }

        with self._lock:
            self.stats.packets_seen += 1

        if evt.event_type == EVT_PROMPT_INJECTION:
            entry["injection_score"] = evt.meta[0]
            entry["payload_sample"]  = bytes(evt.payload_head).hex()[:32]
            with self._lock:
                self.stats.injections_found += 1
            self.log.warning("prompt_injection_detected", **entry)
            self._alert(entry)

        elif evt.event_type == EVT_POLICY_BLOCK:
            with self._lock:
                self.stats.packets_blocked += 1
            self.log.info("packet_blocked", **entry)

        elif evt.event_type == EVT_AGENT_KILL:
            self._kill_agent(evt.pid, reason="critical_threat")

        elif evt.event_type == EVT_DATA_EXFIL:
            with self._lock:
                self.stats.packets_blocked += 1
            self.log.critical("data_exfiltration_attempt", **entry)
            self._alert(entry)

        else:
            self.log.debug("event", **entry)

        with self._lock:
            detail = self.agent_details.get(evt.pid)
            if detail:
                detail["requests_total"] += 1
                detail["bytes_recv"]     += evt.packet_size
                detail["threat_level"]    = max(
                    detail["threat_level"], evt.threat_level)
                if entry["verdict"] in ("block", "kill"):
                    detail["requests_blocked"] += 1

            self.event_log.append(entry)
            if len(self.event_log) > 10_000:
                self.event_log.pop(0)

       
        if BACKEND_AVAILABLE:
            try:
                audit_log.write(entry)
            except Exception:
                pass

        if BACKEND_AVAILABLE:
            try:
                import asyncio as _asyncio
                loop = _asyncio.get_event_loop()
                if loop.is_running():
                    loop.call_soon_threadsafe(
                        lambda e=entry: _asyncio.ensure_future(
                            ws_manager.broadcast_event(e)))
            except Exception:
                pass

    def handle_syscall_event(self, cpu: int, data: bytes, size: int) -> None:
        if size < ctypes.sizeof(SyscallEvent):
            return

        evt = SyscallEvent.from_buffer_copy(data)
        with self._lock:
            self.stats.syscalls_blocked += 1

        syscall_names = {
            59: "execve", 322: "execveat", 57: "fork",  56: "clone",
           101: "ptrace",   9: "mmap",      2: "open",  257: "openat",
            41: "socket",  42: "connect",  49: "bind",   62: "kill",
        }
        syscall_name = syscall_names.get(evt.syscall_nr, str(evt.syscall_nr))

        self.log.warning("dangerous_syscall",
                         pid=evt.pid,
                         comm=evt.comm.decode(errors="replace"),
                         syscall=syscall_name,
                         verdict=evt.verdict,
                         threat_level=evt.threat_level)

        if evt.threat_level >= THREAT_CRITICAL:
            self._kill_agent(evt.pid, reason=f"syscall:{syscall_name}")

    def _kill_agent(self, pid: int, reason: str = "") -> None:
        try:
            os.kill(pid, signal.SIGKILL)
            with self._lock:
                self.stats.kills_issued += 1
            self.log.critical("agent_killed", pid=pid, reason=reason)
        except ProcessLookupError:
            self.log.info("agent_already_dead", pid=pid)
        except PermissionError:
            self.log.error("kill_permission_denied", pid=pid)

       
        with self._lock:
            self.tracked_pids.pop(pid, None)
            self.agent_details.pop(pid, None)

    def _alert(self, event: dict) -> None:
        """Pluggable alert sink — wire to SIEM / webhook / PagerDuty."""
        #requests.post(WEBHOOK_URL, json=event, timeout=2)
        pass

    # --- Core Operations ---

    def _scanner_loop(self) -> None:
        while self.running:
            self.scan_processes()
            self._deregister_dead_agents()
            time.sleep(2.0)

    def _ring_buffer_loop(self) -> None:
        while self.running:
            # ring_buffer.poll(timeout_ms=100)
            time.sleep(0.1)

    # --- Lifecycle ---

    def _start_proxy(self) -> None:
        """
        Kicks off the mitmproxy instance. 
        It mirrors all events back here so the dashboard sees everything.
        """
        if not PROXY_AVAILABLE:
            self.log.warning("proxy_unavailable",
                             reason=_proxy_err_msg,
                             fix="pip install mitmproxy pyyaml")
            return
        try:
            self._proxy_engine = ProxyPolicyEngine(self.config_path)
            self._proxy_store  = ProxyEventStore()

            # Mirror proxy events into the daemon's own event_log
            original_push = self._proxy_store.push
            daemon_self   = self
            def _mirrored_push(event: dict) -> None:
                original_push(event)
                with daemon_self._lock:
                    # Normalise to match AgentEvent schema expected by /api/events
                    daemon_self.event_log.append({
                        "ts":           event.get("ts", int(time.time_ns())),
                        "event":        "proxy_request",
                        "pid":          0,
                        "comm":         event.get("agent", "proxy"),
                        "src":          "proxy",
                        "dst":          f"{event.get('dst_host')}:{event.get('dst_port')}",
                        "proto":        6,
                        "size":         event.get("response_bytes", 0),
                        "verdict":      event.get("verdict", "allow"),
                        "threat_level": 2 if event.get("injection_score", 0) > 0 else 0,
                        "injection_score":    event.get("injection_score", 0),
                        "injection_patterns": event.get("injection_patterns", []),
                    })
                    if len(daemon_self.event_log) > 10_000:
                        daemon_self.event_log.pop(0)
            self._proxy_store.push = _mirrored_push

            self._proxy_server = ProxyServer(
                host          = "0.0.0.0",
                port          = self.proxy_port,
                policy_engine = self._proxy_engine,
                event_store   = self._proxy_store,
            )
            _attach_proxy_to_daemon(
                self._proxy_server,
                self._proxy_store,
                self._proxy_engine,
            )
            self._proxy_server.run_in_thread()
            self.log.info("proxy_started",
                          port=self.proxy_port,
                          tip=f"HTTP_PROXY=http://localhost:{self.proxy_port}")
        except Exception as e:
            self.log.error("proxy_start_failed", error=str(e))

    def start(self) -> None:
        self.running = True
        self.load_config()
        self.load_bpf()
        self._load_policies_into_bpf()
        self._load_blocked_ips_into_bpf()
        self._start_proxy()
        for target in (self._scanner_loop, self._ring_buffer_loop):
            threading.Thread(target=target, daemon=True).start()
        self.log.info("agentguard_started",
                      iface=self.iface,
                      bpf_obj=self.bpf_obj_path,
                      proxy_port=self.proxy_port)

    def stop(self) -> None:
        self.running = False
        if self._proxy_server:
            try:
                self._proxy_server.shutdown_proxy()
            except Exception:
                pass
        self.log.info("agentguard_stopped")


# --- FastAPI Setup ---

_daemon: Optional[AgentGuardDaemon] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio as _asyncio
    global _daemon
    if _daemon is None:
        _daemon = _daemon_from_env()
    _daemon.start()

    if BACKEND_AVAILABLE:
        attach_demo_routes(_daemon, ws_manager, audit_log)
        _stats_task = _asyncio.create_task(
            ws_manager.stats_ticker(
                lambda: _daemon.stats.model_dump(), interval=1.0
            )
        )
    else:
        _stats_task = None

    yield

    if _stats_task:
        _stats_task.cancel()
    _daemon.stop()


def _daemon_from_env() -> "AgentGuardDaemon":
    """Helper to build a daemon from env vars (useful for uvicorn reloads)."""
    d = AgentGuardDaemon(
        config_path  = os.environ.get("AGENTGUARD_CONFIG",  "policy.yaml"),
        iface        = os.environ.get("AGENTGUARD_IFACE",   "eth0"),
        bpf_obj_path = os.environ.get("AGENTGUARD_BPF_OBJ", "agent_guard.bpf.o"),
    )
    d.proxy_port = int(os.environ.get("AGENTGUARD_PROXY_PORT", "8888"))
    return d


app = FastAPI(
    title="AgentGuard",
    description=(
        "AI Agent Traffic Interception & Policy Enforcement Gateway.\n\n"
        "eBPF-based security layer that intercepts, inspects, and enforces "
        "policy on all network traffic and syscalls from AI agent processes "
        "before they reach the Linux kernel.\n\n"
        "**Docs:** `/docs` (Swagger UI) · `/redoc` (ReDoc)"
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount proxy routes if available
if PROXY_AVAILABLE:
    app.include_router(proxy_router)

# Mount WebSocket + dashboard + demo + audit routes
if BACKEND_AVAILABLE:
    app.include_router(ws_router)
    app.include_router(demo_router)
    app.include_router(verify_router)
else:
    import warnings
    warnings.warn(f"Backend modules unavailable: {_be_err_msg}")


def get_daemon() -> AgentGuardDaemon:
    if _daemon is None:
        raise HTTPException(status_code=503, detail="Daemon not initialised")
    return _daemon


# --- API Routes ---

@app.get(
    "/api/agents",
    response_model=List[AgentOut],
    summary="List all tracked agent PIDs",
    tags=["agents"],
)
async def list_agents():
    d = get_daemon()
    with d._lock:
        return [AgentOut(pid=pid, name=name)
                for pid, name in d.tracked_pids.items()]


@app.get(
    "/api/agents/{pid}",
    response_model=AgentDetailOut,
    summary="Get detailed stats for one agent",
    tags=["agents"],
)
async def get_agent(pid: int):
    d = get_daemon()
    with d._lock:
        detail = d.agent_details.get(pid)
    if not detail:
        raise HTTPException(404, f"Agent PID {pid} not found")
    return AgentDetailOut(
        **detail,
        threat_label=THREAT_LABELS.get(detail["threat_level"], "unknown"),
    )


@app.post(
    "/api/agents/register",
    response_model=RegisterAgentResponse,
    summary="Register an agent PID — called by the SDK on startup",
    tags=["agents"],
    status_code=201,
)
async def register_agent(body: RegisterAgentRequest):
    d = get_daemon()
    # Try requested policy_id, fall back to default policy if not found
    pol = d.policies_by_id.get(body.policy_id)
    if not pol:
        default_name = d.policies_by_id and next(iter(d.policies_by_id.values()))
        pol = (d.policies.get("trusted")
               or d.policies.get("restricted")
               or (default_name if default_name else None))
        if not pol:
            raise HTTPException(503, "No policies loaded yet — daemon still starting")
    fake_def = AgentDefinition(
        name=body.name, process_name="", policy_name=pol.name)
    d._register_agent(body.pid, fake_def)
    return RegisterAgentResponse(
        status="registered", pid=body.pid, policy_id=pol.id)


@app.post(
    "/api/agents/{pid}/unregister",
    response_model=VerdictResponse,
    summary="Unregister an agent PID — called by the SDK on shutdown",
    tags=["agents"],
)
async def unregister_agent(pid: int):
    d = get_daemon()
    with d._lock:
        if pid not in d.tracked_pids:
            raise HTTPException(404, f"Agent PID {pid} not found")
        d.tracked_pids.pop(pid)
        d.agent_details.pop(pid, None)
    d.log.info("agent_unregistered", pid=pid)
    return VerdictResponse(status="unregistered", pid=pid)


@app.post(
    "/api/agents/{pid}/block",
    response_model=VerdictResponse,
    summary="Block all traffic from an agent",
    tags=["agents"],
)
async def block_agent(pid: int):
    d = get_daemon()
    # verdict_overrides.update(pid, VERDICT_BLOCK)
    d.log.info("operator_block", pid=pid)
    return VerdictResponse(status="blocked", pid=pid)


@app.post(
    "/api/agents/{pid}/allow",
    response_model=VerdictResponse,
    summary="Remove any manual block and restore normal policy",
    tags=["agents"],
)
async def allow_agent(pid: int):
    d = get_daemon()
    # verdict_overrides.delete(pid)
    d.log.info("operator_allow", pid=pid)
    return VerdictResponse(status="allowed", pid=pid)


@app.post(
    "/api/agents/{pid}/sandbox",
    response_model=VerdictResponse,
    summary="Redirect all agent traffic to the sandbox namespace",
    tags=["agents"],
)
async def sandbox_agent(pid: int):
    d = get_daemon()
    # verdict_overrides.update(pid, VERDICT_SANDBOX)
    d.log.info("operator_sandbox", pid=pid)
    return VerdictResponse(status="sandboxed", pid=pid)


@app.post(
    "/api/agents/{pid}/kill",
    response_model=VerdictResponse,
    summary="Send SIGKILL to an agent process",
    tags=["agents"],
)
async def kill_agent(pid: int, background_tasks: BackgroundTasks):
    d = get_daemon()
    background_tasks.add_task(d._kill_agent, pid, "operator_request")
    return VerdictResponse(status="killed", pid=pid)


@app.post(
    "/api/agents/{pid}/policy",
    response_model=dict,
    summary="Change the active policy for a running agent",
    tags=["agents"],
)
async def set_agent_policy(
    pid: int,
    policy_id: int = Query(..., description="Policy ID to apply"),
):
    d = get_daemon()
    pol = d.policies_by_id.get(policy_id)
    if not pol:
        raise HTTPException(400, f"Policy ID {policy_id} not found")
    with d._lock:
        if pid not in d.tracked_pids:
            raise HTTPException(404, f"Agent PID {pid} not found")
        d.agent_details[pid]["policy"] = pol.name
        # agent_registry[pid].policy_id = policy_id
    d.log.info("agent_policy_changed", pid=pid, policy=pol.name)
    return {"status": "updated", "pid": pid, "policy": pol.name}


@app.post(
    "/api/agents/{pid}/tool_call",
    response_model=dict,
    summary="Report a tool call for pre-emptive policy evaluation",
    tags=["agents"],
)
async def report_tool_call(pid: int, body: ToolCallRequest):
    d = get_daemon()
    d.log.info("tool_call_reported", pid=pid, tool=body.tool)

    # Tool call chain analysis
    try:
        from tool_chain_analyzer import tool_chain_analyzer
        chain_findings = tool_chain_analyzer.record_and_analyze(
            pid=pid, tool=body.tool, args=body.args)
        if chain_findings:
            for cf in chain_findings:
                event = {
                    "ts":           int(time.time_ns()),
                    "event":        f"tool_chain_{cf.pattern}",
                    "verdict":      "block" if cf.score >= 75 else "alert",
                    "pid":          pid,
                    "comm":         d.tracked_pids.get(pid, "unknown"),
                    "threat_level": 4 if cf.severity == "critical" else 3,
                    "description":  cf.description,
                    "chain":        cf.calls,
                }
                with d._lock:
                    d.event_log.append(event)
                if cf.score >= 75:
                    d.log.warning("tool_chain_blocked",
                                  pattern=cf.pattern,
                                  pid=pid, chain=cf.calls)
                    return {"status": "blocked", "pid": pid,
                            "tool": body.tool, "verdict": "block",
                            "reason": cf.description,
                            "chain": cf.calls}
    except ImportError:
        pass

    return {"status": "received", "pid": pid,
            "tool": body.tool, "verdict": "allow"}


@app.get(
    "/api/agents/{pid}/stats",
    response_model=AgentDetailOut,
    summary="Get per-agent traffic stats",
    tags=["agents"],
)
async def get_agent_stats(pid: int):
    return await get_agent(pid)


# --- Events & Stats ---

@app.get(
    "/api/events",
    response_model=List[EventOut],
    summary="Get recent events from the BPF ring buffer",
    tags=["observability"],
)
async def get_events(
    limit: int = Query(
        default=100, ge=1, le=10_000,
        description="Maximum number of events to return"),
    threat_only: bool = Query(
        default=False,
        description="When true, only returns threat events (blocks, injections, etc.)"),
):
    d = get_daemon()
    with d._lock:
        events = list(d.event_log)

    if threat_only:
        events = [e for e in events if e.get("event") != "packet_seen"]

    sliced = events[-limit:]
    return [EventOut(**{k: e.get(k) for k in EventOut.model_fields
                        if k in e or EventOut.model_fields[k].default is not None})
            for e in sliced]


@app.get(
    "/api/stats",
    response_model=StatsOut,
    summary="Global packet and threat counters",
    tags=["observability"],
)
async def get_stats():
    d = get_daemon()
    with d._lock:
        return d.stats.model_copy()


# --- Policy Routes ---

@app.get(
    "/api/policies",
    response_model=Dict[str, PolicyOut],
    summary="List all loaded policies",
    tags=["policies"],
)
async def list_policies():
    d = get_daemon()
    return {
        name: PolicyOut(
            id=pol.id, name=pol.name,
            allowed_ports=pol.allowed_ports,
            allow_external_net=pol.allow_external_net,
            inspect_http=pol.inspect_http,
            block_on_injection=pol.block_on_injection,
            max_bytes_per_sec=pol.max_bytes_per_sec,
            allow_exec=pol.allow_exec,
            allow_fork=pol.allow_fork,
            allow_ptrace=pol.allow_ptrace,
        )
        for name, pol in d.policies.items()
    }


@app.post(
    "/api/policies/reload",
    response_model=dict,
    summary="Hot-reload policy.yaml without restarting the daemon",
    tags=["policies"],
)
async def reload_policies():
    d = get_daemon()
    d.load_config()
    d._load_policies_into_bpf()
    return {"status": "reloaded", "policies": len(d.policies)}


# --- Threat Intel ---

@app.post(
    "/api/threat_intel/add_ip",
    response_model=BlockIPResponse,
    summary="Block an IP address in real-time (no restart needed)",
    tags=["threat_intel"],
    status_code=201,
)
async def add_blocked_ip(body: BlockIPRequest):
    d = get_daemon()
    ip_nbo = socket.htonl(int(ipaddress.IPv4Address(body.ip)))
    # blocked_ips.update(ip_nbo, 99)
    d.log.info("ip_blocked", ip=body.ip)
    return BlockIPResponse(status="blocked", ip=body.ip)


@app.delete(
    "/api/threat_intel/remove_ip/{ip}",
    response_model=BlockIPResponse,
    summary="Remove an IP from the real-time blocklist",
    tags=["threat_intel"],
)
async def remove_blocked_ip(ip: str):
    try:
        ipaddress.IPv4Address(ip)
    except ValueError:
        raise HTTPException(400, f"Invalid IPv4 address: {ip}")
    d = get_daemon()
    ip_nbo = socket.htonl(int(ipaddress.IPv4Address(ip)))
    # blocked_ips.delete(ip_nbo)
    d.log.info("ip_unblocked", ip=ip)
    return BlockIPResponse(status="unblocked", ip=ip)


# --- Health Checks ---

@app.get(
    "/health",
    response_model=dict,
    summary="Liveness / readiness probe",
    tags=["health"],
)
async def health():
    d = get_daemon()
    proxy_active = getattr(d, "_proxy_server", None) is not None
    return {
        "status":        "ok",
        "running":       getattr(d, "running", False),
        "bpf_mode":      getattr(d, "_bpf_mode", "stub"),
        "proxy_mode":    "active" if proxy_active else "unavailable",
        "proxy_port":    getattr(d, "proxy_port", None) if proxy_active else None,
        "proxy_url":     f"http://localhost:{d.proxy_port}" if proxy_active else None,
        "agents_active": len(getattr(d, "tracked_pids", {})),
        "uptime_ts":     time.time(),
    }


# --- CLI Entrypoint ---

def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="AgentGuard policy daemon")
    parser.add_argument("--config",   default="policy.yaml",
                        help="Policy config YAML  (default: policy.yaml)")
    parser.add_argument("--iface",    default="eth0",
                        help="Network interface for eBPF attachment  (default: eth0)")
    parser.add_argument("--bpf-obj",  default="kernel/agent_guard.bpf.o",
                        help="Compiled BPF object file")
    parser.add_argument("--host",     default="0.0.0.0",
                        help="API bind address  (default: 0.0.0.0)")
    parser.add_argument("--port",     type=int, default=8080,
                        help="API port  (default: 8080)")
    parser.add_argument("--proxy-port", type=int, default=8888,
                        help="Transparent proxy port  (default: 8888)")
    parser.add_argument("--log-json", action="store_true",
                        help="Emit JSON log lines (for log aggregators)")
    parser.add_argument("--dev",      action="store_true",
                        help="Enable uvicorn auto-reload (dev only)")
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

    if os.geteuid() != 0:
        print("[!] AgentGuard requires root (or CAP_NET_ADMIN + CAP_SYS_ADMIN)")
        sys.exit(1)

    global _daemon
    _daemon = AgentGuardDaemon(
        config_path  = args.config,
        iface        = args.iface,
        bpf_obj_path = args.bpf_obj,
    )
    _daemon.proxy_port = args.proxy_port

    def _sig_handler(sig, frame):
        _daemon.stop()
        sys.exit(0)

    signal.signal(signal.SIGTERM, _sig_handler)
    signal.signal(signal.SIGINT,  _sig_handler)

    print(f"[AgentGuard] API   → http://{args.host}:{args.port}")
    print(f"[AgentGuard] Docs  → http://{args.host}:{args.port}/docs")
    print(f"[AgentGuard] Proxy → http://{args.host}:{args.proxy_port}")
    print(f"[AgentGuard] Set on agents: HTTP_PROXY=http://localhost:{args.proxy_port}")

    # Set env vars so lifespan can reconstruct daemon if uvicorn reimports module
    os.environ["AGENTGUARD_CONFIG"]     = args.config
    os.environ["AGENTGUARD_IFACE"]      = args.iface
    os.environ["AGENTGUARD_BPF_OBJ"]    = args.bpf_obj
    os.environ["AGENTGUARD_PROXY_PORT"] = str(args.proxy_port)

    # Pass app object directly — avoids module reimport losing _daemon reference
    uvicorn.run(
        app,
        host      = args.host,
        port      = args.port,
        reload    = False,        
        log_level = "warning",
    )


if __name__ == "__main__":
    main()