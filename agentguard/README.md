# AgentGuard — AI Agent Traffic Interception Framework

eBPF-based security layer that intercepts, inspects, and enforces policy
on all network traffic and syscalls from AI agent processes — **before**
they reach the Linux kernel or leave the machine.

## What it does

```
Agent process
     │  makes a network call / syscall
     ▼
[TC egress / XDP hook]  ◄── intercepts HERE, pre-kernel
     │
     ▼
[BPF policy engine]     ← checks agent identity, policy rules, injection patterns
     │
     ├── ALLOW  → packet proceeds normally
     ├── BLOCK  → XDP_DROP / TC_ACT_SHOT (silent, wire-level)
     ├── SANDBOX → redirect to isolated network namespace
     └── KILL   → userspace daemon sends SIGKILL to agent PID
```

## Intercept points

| Hook | What it catches | When |
|------|----------------|------|
| `XDP` (ingress) | Inbound packets to agent | Pre-kernel, before TCP stack |
| `TC egress` | Outbound API calls, C2 callbacks, data exfil | Before packet leaves NIC |
| `TC ingress` | Inbound responses | After NIC, before socket |
| `tracepoint/raw_syscalls` | exec, fork, ptrace, raw socket, kill | At syscall entry |
| `kprobe/sys_connect` | connect() before SYN is sent | Earliest egress point |

## Policy enforcement

- **Port whitelisting** — agent can only reach allowed ports (e.g. `443` only for restricted agents)
- **External network restriction** — block all non-RFC1918 destinations
- **HTTP payload inspection** — scan TCP payload for prompt injection markers, API key leaks, credential exfiltration
- **Rate limiting** — token bucket per agent, configurable MB/s cap
- **Syscall blocking** — prevent `execve`, `fork`, `ptrace`, raw sockets
- **IP blocklist** — threat intel CIDRs blocked at wire speed (XDP)
- **Threat escalation** — each dangerous event increments threat level; at CRITICAL the agent is killed

## Threat detection (in BPF, zero userspace latency)

| Threat | Detection method |
|--------|-----------------|
| Prompt injection | Pattern match on HTTP payload (IGNORE, DAN, `<\|system\|>`, `[INST]`, etc.) |
| API key exfiltration | Detect `sk-`, `ghp_`, `AKIA` prefixes in outbound body |
| C2 callback | IP matches threat intel blocklist |
| Shell escape | `execve`/`execveat` from agent PID |
| Privilege escalation | `ptrace` syscall from agent PID |
| Data exfiltration | Outbound byte rate exceeds policy threshold |
| Port scanning | TCP SYN count to agent's src_ip exceeds threshold |

## Quick start

### Docker (recommended)

```bash
# Clone and configure
git clone <this-repo>
cd agentguard
cp policy.yaml.example policy.yaml

# Build and run
docker compose up -d agentguard

# Check it's working
curl http://localhost:8080/api/stats
```

### WSL2

WSL2 uses a real Linux kernel (5.15+ on Windows 11 22H2) that supports eBPF.

```bash
# Check kernel BPF support
cat /boot/config-$(uname -r) | grep BPF

# Install build deps
sudo apt install clang-14 libbpf-dev iproute2 python3-bcc

# Compile BPF object
cd kernel
clang -O2 -g -target bpf -D__TARGET_ARCH_x86 \
    -I/usr/include/x86_64-linux-gnu           \
    agent_guard.bpf.c -o agent_guard.bpf.o

# Run daemon (root required)
cd ..
sudo python3 daemon/policy_daemon.py          \
    --config policy.yaml                      \
    --iface eth0                              \
    --bpf-obj kernel/agent_guard.bpf.o

# Attach XDP (generic mode for WSL/virtual NICs)
sudo ip link set dev eth0 xdp obj kernel/agent_guard.bpf.o \
    sec xdp/ingress generic

# Attach TC egress
sudo tc qdisc add dev eth0 clsact
sudo tc filter add dev eth0 egress bpf da              \
    obj kernel/agent_guard.bpf.o sec tc/egress
sudo tc filter add dev eth0 ingress bpf da             \
    obj kernel/agent_guard.bpf.o sec tc/ingress
```

### Integrate with your agent (one line)

```python
from agentguard_sdk import AgentGuard, Policy

guard = AgentGuard()
guard.register("my-langchain-agent", Policy.RESTRICTED)

# Your existing agent code — no other changes needed
from langchain.agents import AgentExecutor
# ...
```

## Operator API

```bash
# List tracked agents
curl http://localhost:8080/api/agents

# Block a specific agent (all traffic dropped)
curl -X POST http://localhost:8080/api/agents/1234/block

# Sandbox an agent (redirect to honeypot)
curl -X POST http://localhost:8080/api/agents/1234/sandbox

# Kill an agent process
curl -X POST http://localhost:8080/api/agents/1234/kill

# Block an IP in real-time (no restart needed)
curl -X POST http://localhost:8080/api/threat_intel/add_ip \
    -H 'Content-Type: application/json' \
    -d '{"ip": "185.220.101.5"}'

# Recent events
curl http://localhost:8080/api/events?limit=50
```

## Files

```
agentguard/
├── kernel/
│   └── agent_guard.bpf.c      # eBPF kernel program (XDP + TC + tracepoint)
├── daemon/
│   ├── policy_daemon.py        # Userspace enforcement daemon
│   └── requirements.txt
├── sdk/
│   └── agentguard_sdk.py       # Python integration SDK
├── policy.yaml                 # Policy definitions + agent registry
├── Dockerfile                  # Production container
└── docker-compose.yml          # Full deployment
```

## Kernel requirements

| Feature | Min kernel | Notes |
|---------|-----------|-------|
| eBPF core | 4.4 | |
| XDP | 4.8 | Use `generic` mode on WSL/virtual NICs |
| TC BPF | 4.1 | |
| `tracepoint/raw_syscalls` | 4.7 | |
| Ring buffer | 5.8 | Required (replaces perf buffer) |
| LRU maps | 4.10 | For flow table + agent registry |

WSL2 on Windows 11 22H2+ ships kernel 5.15 — all features available.

## Security model

AgentGuard is **not** a replacement for sandboxing (seccomp, namespaces, capabilities).
It is a **visibility and enforcement layer** between the agent and the network/kernel.

Best practice: run agents with:
- Minimal Linux capabilities (`--cap-drop ALL`)
- Seccomp profiles (block unnecessary syscalls)
- AgentGuard eBPF layer (policy enforcement + anomaly detection)
- Network namespaces (isolate agent network stack)

The BPF programs run in the kernel at highest trust — they are verified by the
kernel verifier before loading and cannot crash the kernel.
