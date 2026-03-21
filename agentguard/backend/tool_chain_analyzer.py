"""
Tool Call Chain Analyzer
=========================
Tracks sequences of tool calls per agent session.
Catches agentic hijacking where each individual call
looks clean but the chain reveals malicious intent.

From the blog:
  Step 1: read document (clean)
  Step 2: access internal files (slightly suspicious)
  Step 3: write to zip (suspicious)
  Step 4: upload to external URL (BLOCK)

Each step alone may score below threshold.
The chain together is a clear exfiltration pattern.

Integrated into /api/agents/{pid}/tool_call endpoint.
"""

import logging
import time
from collections import defaultdict
from dataclasses import dataclass, field
from threading import Lock
from typing import Dict, List, Optional, Tuple

log = logging.getLogger("chain_analyzer")


@dataclass
class ToolCall:
    tool:      str
    args:      dict
    timestamp: float
    pid:       int


@dataclass
class ChainFinding:
    pattern:     str
    description: str
    severity:    str
    score:       int
    calls:       List[str]  # tool names in the suspicious chain


# Known dangerous tool call sequences
# Format: (pattern_name, [ordered_tool_keywords], description, severity, score)
DANGEROUS_CHAINS = [
    (
        "read_then_upload",
        [["read", "fetch", "get", "load", "open", "summarize"],
         ["upload", "post", "send", "transmit", "write", "export"]],
        "Document read followed by external upload — agentic exfiltration pattern",
        "critical", 90,
    ),
    (
        "file_access_then_network",
        [["file", "read", "open", "access", "load"],
         ["http", "request", "api", "call", "fetch", "url"]],
        "File access followed by network call — possible data exfiltration",
        "high", 75,
    ),
    (
        "archive_creation",
        [["read", "collect", "gather", "fetch"],
         ["zip", "compress", "archive", "tar", "pack"]],
        "Data collection followed by archiving — data staging pattern",
        "high", 80,
    ),
    (
        "web_to_private_tool",
        [["browse", "web", "search", "fetch_url", "scrape"],
         ["email", "message", "sms", "calendar", "notes", "contact"]],
        "Web content bridged to private communication tool — cross-connector attack",
        "critical", 85,
    ),
    (
        "credential_access",
        [["env", "config", "secret", "credential", "key", "token", "password"],
         ["send", "post", "upload", "log", "write", "store"]],
        "Credential access followed by transmission — credential exfiltration",
        "critical", 95,
    ),
    (
        "rapid_multi_tool",
        None,  # special: any 5+ different tools in 30 seconds
        "Rapid multi-tool usage — automated tool abuse pattern",
        "medium", 60,
    ),
]

# Window within which a chain is considered connected
CHAIN_WINDOW_SECONDS = 60


class ToolChainAnalyzer:
    """
    Maintains per-agent tool call history and detects dangerous chains.
    Thread-safe — called from multiple proxy threads simultaneously.
    """

    def __init__(self):
        self._lock     = Lock()
        # pid -> list of ToolCall (rolling window)
        self._sessions: Dict[int, List[ToolCall]] = defaultdict(list)

    def record_and_analyze(self, pid: int, tool: str,
                           args: dict) -> List[ChainFinding]:
        """
        Record a tool call and check if it completes a dangerous chain.
        Returns list of ChainFinding (empty = clean).
        """
        call = ToolCall(
            tool      = tool.lower(),
            args      = args,
            timestamp = time.time(),
            pid       = pid,
        )

        with self._lock:
            self._sessions[pid].append(call)
            # Keep only calls within window
            cutoff = time.time() - CHAIN_WINDOW_SECONDS
            self._sessions[pid] = [
                c for c in self._sessions[pid]
                if c.timestamp > cutoff
            ]
            session = list(self._sessions[pid])

        return self._analyze_chain(session)

    def clear_session(self, pid: int):
        """Clear session when agent unregisters."""
        with self._lock:
            self._sessions.pop(pid, None)

    def _analyze_chain(self, session: List[ToolCall]) -> List[ChainFinding]:
        findings = []
        tool_names = [c.tool for c in session]

        for pattern_name, keyword_groups, description, severity, score in DANGEROUS_CHAINS:

            # Special case: rapid multi-tool
            if keyword_groups is None:
                unique_tools = set(tool_names)
                if len(unique_tools) >= 5 and len(session) >= 5:
                    time_span = session[-1].timestamp - session[0].timestamp
                    if time_span < 30:
                        findings.append(ChainFinding(
                            pattern     = pattern_name,
                            description = description,
                            severity    = severity,
                            score       = score,
                            calls       = list(unique_tools),
                        ))
                continue

            # Check ordered keyword groups
            if self._matches_ordered_chain(tool_names, keyword_groups):
                matched_tools = self._extract_matched(tool_names, keyword_groups)
                findings.append(ChainFinding(
                    pattern     = pattern_name,
                    description = description,
                    severity    = severity,
                    score       = score,
                    calls       = matched_tools,
                ))
                log.warning(f"Tool chain detected: {pattern_name} "
                            f"pid={session[0].pid if session else '?'} "
                            f"chain={matched_tools}")

        return findings

    def _matches_ordered_chain(self, tools: List[str],
                                keyword_groups: List[List[str]]) -> bool:
        """
        Check if tool list contains each keyword group in order.
        Group 1 must appear before Group 2 in the session.
        """
        last_idx = -1
        for group in keyword_groups:
            found = False
            for i, tool in enumerate(tools):
                if i <= last_idx:
                    continue
                if any(kw in tool for kw in group):
                    last_idx = i
                    found    = True
                    break
            if not found:
                return False
        return True

    def _extract_matched(self, tools: List[str],
                         keyword_groups: List[List[str]]) -> List[str]:
        """Extract the specific tool names that matched each group."""
        matched  = []
        last_idx = -1
        for group in keyword_groups:
            for i, tool in enumerate(tools):
                if i <= last_idx:
                    continue
                if any(kw in tool for kw in group):
                    matched.append(tool)
                    last_idx = i
                    break
        return matched


# Singleton
tool_chain_analyzer = ToolChainAnalyzer()
