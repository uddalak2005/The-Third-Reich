# AgentGuard Live Demo

5-moment security demonstration for MNC presentations.  
Everything runs on **Windows + Docker** — no Linux required.

---

## Quick start (2 terminals)

**Terminal 1 — Start AgentGuard:**
```bash
docker-compose up
```
Wait for: `[AgentGuard] API → http://0.0.0.0:8080`

**Terminal 2 — Run the demo:**
```bash
pip install requests
python demo/demo_runner.py
```

---

## The 5 moments

| # | Moment | What happens | Dashboard |
|---|--------|-------------|-----------|
| 1 | **Benign traffic** | Agent makes normal API calls | All green ✓ |
| 2 | **Prompt injection** | Poisoned tool output → detected + blocked | Red injection alerts |
| 3 | **C2 callback** | Agent tries to phone home to Tor exit node | C2 blocked |
| 4 | **Data exfiltration** | Agent tries to POST credentials externally | Exfil blocked |
| 5 | **Agent kill** | Critical threat → SIGKILL | Kill event |

---

## Demo runner options

```bash
# Full demo (default)
python demo/demo_runner.py

# Single scenario
python demo/demo_runner.py --scenario injection
python demo/demo_runner.py --scenario c2
python demo/demo_runner.py --scenario exfil

# Interactive mode — press ENTER between moments (best for live presentations)
python demo/demo_runner.py --interactive

# Against a remote daemon
python demo/demo_runner.py --daemon http://your-server:8080
```

---

## Live agents (real traffic through proxy)

These scripts make **actual HTTP requests** through the proxy — the detection
is real, not simulated. Use them to show live traffic in the dashboard.

```bash
# Benign agent — shows green traffic
set HTTP_PROXY=http://localhost:8888
set HTTPS_PROXY=http://localhost:8888
python demo/agents/benign_agent.py

# Injection agent — fires real injection payloads
python demo/agents/injection_agent.py

# C2 agent — attempts real connections to blocklisted IPs
python demo/agents/c2_agent.py
```

---

## Dashboard API cheat sheet

| Endpoint | What it does |
|----------|-------------|
| `GET /api/dashboard` | Full dashboard payload (stats + events + agents) |
| `GET /api/events?threat_only=true` | Only blocked/injected events |
| `GET /api/stats` | Live counters |
| `WS  ws://localhost:8080/ws/dashboard` | Real-time event stream |
| `GET /api/audit/download/csv` | Download full audit log |
| `POST /api/demo/reset` | Clear all counters (between demos) |
| `POST /api/demo/simulate_attack` | Trigger scenario from API |
| `GET /docs` | Full API docs (Swagger UI) |

---

## What to say at each moment

**Moment 1 (Benign):**
> "This is a normal LangChain agent making API calls. Every request passes
> through AgentGuard's proxy layer in real time — zero code changes to the agent."

**Moment 2 (Injection):**
> "The agent's tool just returned a poisoned response. AgentGuard's pattern
> engine scored it 88 out of 100 — system token injection detected.
> The payload never reached the LLM."

**Moment 3 (C2):**
> "The agent tried to open a TCP connection to a Tor exit node.
> Our threat intelligence blocklist caught it at the proxy layer.
> The C2 server never saw a single packet."

**Moment 4 (Exfiltration):**
> "The agent tried to POST what looks like credentials to Pastebin.
> OpenAI key pattern matched. Connection dropped. Keys stayed inside the perimeter."

**Moment 5 (Kill):**
> "Threat level hit CRITICAL — four violations in 30 seconds.
> AgentGuard sent SIGKILL to the agent process.
> And here's the full audit trail you can hand to your compliance team."
> *(download the CSV)*

---

## Compliance handoff

After the demo, download the audit log for the security team:
```
GET http://localhost:8080/api/audit/download/csv
GET http://localhost:8080/api/audit/download/jsonl
```

The JSONL format is natively ingestible by:
Splunk · Datadog · AWS CloudWatch · Elastic · Google Cloud Logging
