#!/usr/bin/env python3
"""
Benign Agent — Demo Moment 1
==============================
A well-behaved AI agent that makes normal, safe API calls through the proxy.
Shows the dashboard staying green — normal traffic, all allowed.

Usage:
    HTTP_PROXY=http://localhost:8888 python demo/agents/benign_agent.py
    HTTP_PROXY=http://localhost:8888 HTTPS_PROXY=http://localhost:8888 \
        python demo/agents/benign_agent.py
"""

import os
import sys
import time
import random

# Register with AgentGuard (if SDK available)
try:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../sdk"))
    from agentguard_sdk import AgentGuard, Policy
    guard = AgentGuard(daemon_url="http://localhost:8080")
    guard.register("benign-demo-agent", policy=Policy.TRUSTED)
    print("[AgentGuard] Registered as benign-demo-agent / TRUSTED policy")
except Exception as e:
    print(f"[AgentGuard] SDK not available ({e}) — continuing without registration")

try:
    import requests
except ImportError:
    print("[!] pip install requests")
    sys.exit(1)

PROMPTS = [
    "Summarise the key points of the quarterly report.",
    "What are the best practices for Python error handling?",
    "Write a short email declining a meeting politely.",
    "Explain the difference between TCP and UDP.",
    "List three ways to improve team productivity.",
]

print("\n[Benign Agent] Starting normal operation...")
print("[Benign Agent] All traffic routed through AgentGuard proxy\n")

session = requests.Session()
# If REQUESTS_CA_BUNDLE is set to the AgentGuard CA, HTTPS inspection works too.
# For demo purposes we disable SSL verification to avoid needing the CA cert.
session.verify = False

import urllib3
urllib3.disable_warnings()

for i, prompt in enumerate(PROMPTS, 1):
    print(f"[{i}/{len(PROMPTS)}] Sending: \"{prompt[:60]}...\"")
    try:
        # This traffic flows through the proxy — AgentGuard inspects it
        r = session.post(
            "https://httpbin.org/post",   # safe test endpoint
            json={"prompt": prompt, "model": "claude-3-5-sonnet"},
            timeout=10,
        )
        print(f"         Status: {r.status_code} — {len(r.content)} bytes — ALLOWED ✓")
    except requests.exceptions.ConnectionError:
        print("         [proxy not running — skipping]")
    except Exception as e:
        print(f"         Error: {e}")
    time.sleep(random.uniform(0.8, 1.5))

print("\n[Benign Agent] Done. All requests completed without incident.")
