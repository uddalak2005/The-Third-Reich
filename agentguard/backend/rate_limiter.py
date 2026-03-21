"""
Rate Limiter + Tarpit
======================
Per-agent request rate limiting and progressive slowdown
for suspicious sessions.

Rate limiting:
  - Normal agents: 100 requests/minute
  - After injection attempt: 10 requests/minute
  - After block: progressive slowdown (tarpit)

Tarpit:
  Suspicious sessions get progressively slower responses.
  Automated attack tools time out. Legitimate agents
  never notice the small delays.

  Attempt 1: +100ms
  Attempt 2: +500ms
  Attempt 3: +1000ms
  Attempt 4: +3000ms
  Attempt 5+: +5000ms
"""

import logging
import time
from collections import defaultdict, deque
from threading import Lock
from typing import Dict, Deque

log = logging.getLogger("rate_limiter")

# Requests per minute limits
NORMAL_RPM    = 100
SUSPECT_RPM   = 10
WINDOW_SECS   = 60

# Tarpit delays in seconds per strike level
TARPIT_DELAYS = [0.1, 0.5, 1.0, 3.0, 5.0]


class RateLimiter:
    def __init__(self):
        self._lock        = Lock()
        # agent_id -> deque of timestamps
        self._requests:   Dict[str, Deque[float]] = defaultdict(deque)
        # agent_id -> strike count (for tarpit)
        self._strikes:    Dict[str, int]          = defaultdict(int)
        # agent_id -> suspect flag
        self._suspects:   Dict[str, bool]         = defaultdict(bool)

    def check_and_record(self, agent_id: str) -> tuple:
        """
        Check rate limit and apply tarpit if needed.
        Returns (allowed: bool, delay_seconds: float, reason: str).
        Call this BEFORE processing the request.
        """
        with self._lock:
            now    = time.time()
            cutoff = now - WINDOW_SECS
            q      = self._requests[agent_id]

            # Purge old timestamps
            while q and q[0] < cutoff:
                q.popleft()

            # Check limit
            limit   = SUSPECT_RPM if self._suspects[agent_id] else NORMAL_RPM
            current = len(q)

            if current >= limit:
                return False, 0, f"rate_limit:{current}/{limit}rpm"

            # Record this request
            q.append(now)

            # Apply tarpit delay if agent has strikes
            strikes = self._strikes[agent_id]
            delay   = TARPIT_DELAYS[min(strikes, len(TARPIT_DELAYS) - 1)] \
                      if strikes > 0 else 0.0

            return True, delay, "ok"

    def record_block(self, agent_id: str):
        """Called when a request is blocked — adds a strike."""
        with self._lock:
            self._strikes[agent_id] += 1
            self._suspects[agent_id] = True
            strikes = self._strikes[agent_id]
            log.info(f"Strike recorded: agent={agent_id} "
                     f"strikes={strikes} "
                     f"tarpit_delay={TARPIT_DELAYS[min(strikes-1, len(TARPIT_DELAYS)-1)]}s")

    def record_allow(self, agent_id: str):
        """Gradually reduce strikes on clean traffic."""
        with self._lock:
            if self._strikes[agent_id] > 0:
                self._strikes[agent_id] = max(
                    0, self._strikes[agent_id] - 1)
            if self._strikes[agent_id] == 0:
                self._suspects[agent_id] = False

    def reset(self, agent_id: str):
        """Reset on agent unregister."""
        with self._lock:
            self._requests.pop(agent_id, None)
            self._strikes.pop(agent_id, None)
            self._suspects.pop(agent_id, None)

    def status(self, agent_id: str) -> dict:
        with self._lock:
            q = self._requests.get(agent_id, deque())
            return {
                "agent_id":    agent_id,
                "requests_1m": len(q),
                "strikes":     self._strikes.get(agent_id, 0),
                "suspect":     self._suspects.get(agent_id, False),
                "tarpit_delay": TARPIT_DELAYS[
                    min(self._strikes.get(agent_id, 0),
                        len(TARPIT_DELAYS) - 1)],
            }


# Singleton
rate_limiter = RateLimiter()
