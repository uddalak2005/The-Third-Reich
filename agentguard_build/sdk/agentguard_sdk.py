"""
AgentGuard SDK
"""

import os
import socket
import atexit
import logging
from enum import IntEnum
from typing import Optional

import requests

logger = logging.getLogger("agentguard")


class Policy(IntEnum):
    """Maps to policy IDs in policy.yaml."""
    RESTRICTED  = 1  
    INTERNAL    = 2   
    TRUSTED     = 3   
    QUARANTINE  = 4   


class AgentGuard:
    """
    AgentGuard client SDK.
    """

    def __init__(
        self,
        daemon_url: str = "http://localhost:8080",
        auto_deregister: bool = True,
    ):
        self.daemon_url       = daemon_url.rstrip("/")
        self.pid              = os.getpid()
        self.registered       = False
        self._agent_name      = None

        if auto_deregister:
            atexit.register(self.unregister)

    def register(
        self,
        name: str,
        policy: Policy = Policy.RESTRICTED,
        tags: Optional[list] = None,
    ) -> bool:
        """
        Register this process with the AgentGuard daemon.
        """
        self._agent_name = name
        payload = {
            "pid":       self.pid,
            "name":      name,
            "policy_id": int(policy),
            "hostname":  socket.gethostname(),
            "tags":      tags or [],
        }
        try:
            resp = requests.post(
                f"{self.daemon_url}/api/agents/register",
                json=payload,
                timeout=2.0,
            )
            if resp.ok:
                self.registered = True
                logger.info(f"[AgentGuard] Registered PID {self.pid} as "
                            f"'{name}' with policy={policy.name}")
                return True
            else:
                logger.warning(f"[AgentGuard] Registration failed: {resp.text}")
                return False
        except requests.exceptions.ConnectionError:
            logger.warning(
                "[AgentGuard] Daemon unreachable — running unguarded. "
                "Start the daemon: docker compose up agentguard"
            )
            return False

    def unregister(self) -> None:
        if not self.registered:
            return
        try:
            requests.post(
                f"{self.daemon_url}/api/agents/{self.pid}/unregister",
                timeout=2.0,
            )
            logger.info(f"[AgentGuard] Unregistered PID {self.pid}")
        except Exception:
            pass
        finally:
            self.registered = False

    def set_policy(self, policy: Policy) -> bool:
        """Dynamically change the policy for this running agent."""
        try:
            resp = requests.post(
                f"{self.daemon_url}/api/agents/{self.pid}/policy",
                json={"policy_id": int(policy)},
                timeout=2.0,
            )
            return resp.ok
        except Exception:
            return False

    def get_stats(self) -> dict:
        """Retrieve per-agent stats from the daemon."""
        try:
            resp = requests.get(
                f"{self.daemon_url}/api/agents/{self.pid}/stats",
                timeout=2.0,
            )
            return resp.json() if resp.ok else {}
        except Exception:
            return {}

    def report_tool_call(self, tool_name: str, args: dict) -> None:
        """
        Optional: Notify AgentGuard before making a tool call.
        This allows the daemon to make a pre-emptive policy decision
        before the syscall or network connection is even attempted.
        """
        try:
            requests.post(
                f"{self.daemon_url}/api/agents/{self.pid}/tool_call",
                json={"tool": tool_name, "args": args},
                timeout=1.0,
            )
        except Exception:
            pass

    def __repr__(self) -> str:
        status = "registered" if self.registered else "unregistered"
        return f"<AgentGuard pid={self.pid} name={self._agent_name} {status}>"


def langchain_callback(guard: "AgentGuard"):
    """
    Returns a LangChain callback handler that notifies AgentGuard
    before each tool call, giving the daemon a chance to pre-approve.
    """
    try:
        from langchain.callbacks.base import BaseCallbackHandler

        class AgentGuardCallback(BaseCallbackHandler):
            def on_tool_start(self, serialized, input_str, **kwargs):
                tool_name = serialized.get("name", "unknown")
                guard.report_tool_call(tool_name, {"input": input_str})

        return AgentGuardCallback()
    except ImportError:
        logger.warning("[AgentGuard] langchain not installed, skipping callback")
        return None


# --- Local Test ---

if __name__ == "__main__":
    print("AgentGuard SDK — quick test")

    guard = AgentGuard(daemon_url="http://localhost:8080")
    ok = guard.register("test-agent", policy=Policy.RESTRICTED)
    print(f"Registered: {ok}")
    print(f"Stats: {guard.get_stats()}")
    guard.unregister()
