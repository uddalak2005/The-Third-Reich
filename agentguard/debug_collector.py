
import sys
import os
from pathlib import Path

# Emulate exploitation_lab.py path logic
sys.path.insert(0, "/app/Exploitation_Lab")

from core.collector import AttackCollector
from config.settings import Settings

os.environ["GHOST_CONFIG"] = "/app/config/config.yaml"

settings = Settings()
collector = AttackCollector(settings)

print(f"Checking for audit log...")
for p in [
    Path("../logs/agentguard-audit.jsonl"),
    Path("logs/agentguard-audit.jsonl"),
    Path("/app/logs/agentguard-audit.jsonl"),
]:
    exists = p.exists()
    print(f"Path: {p} Exists: {exists}")

import asyncio
async def test():
    seeds = await collector.collect()
    print(f"Seeds collected: {len(seeds)}")
    for s in seeds:
         print(f" - Seed: {s.attack_id} | {s.payload_text[:50]}...")

asyncio.run(test())
