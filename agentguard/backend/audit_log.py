"""
AgentGuard Audit Log
Writes security events to a JSON Lines file.
Format: One JSON object per line.
Log location: ./logs/agentguard-audit.jsonl
"""

import csv
import io
import json
import os
import threading
import time
from pathlib import Path
from typing import Iterator, List, Optional

import structlog

log = structlog.get_logger()

_DEFAULT_LOG_PATH = Path(os.environ.get(
    "AGENTGUARD_AUDIT_LOG",
    Path(__file__).parent.parent / "logs" / "agentguard-audit.jsonl"
))


class AuditLog:
    """
    Thread-safe, append-only logger for security events.
    Uses JSON Lines format: one JSON object per line.
    """

    def __init__(self, path: Optional[Path] = None):
        self.path = Path(path or _DEFAULT_LOG_PATH)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._entry_count = self._count_existing()
        log.info("audit_log_ready", path=str(self.path),
                 existing_entries=self._entry_count)

    def _count_existing(self) -> int:
        if not self.path.exists():
            return 0
        try:
            return sum(1 for _ in self.path.open())
        except Exception:
            return 0

    # --- Write Operations ---

    def write(self, event: dict) -> None:
        """
        Appends a single event. Adds wall-clock timestamps automatically.
        """
        entry = {
            "wall_ts":  time.time(),
            "iso_time": _iso_now(),
            **event,
        }
        line = json.dumps(entry, default=str) + "\n"
        with self._lock:
            with self.path.open("a", encoding="utf-8") as f:
                f.write(line)
            self._entry_count += 1

    def write_batch(self, events: List[dict]) -> None:
        """Write multiple events atomically (single file open)."""
        lines = []
        for event in events:
            entry = {"wall_ts": time.time(), "iso_time": _iso_now(), **event}
            lines.append(json.dumps(entry, default=str) + "\n")
        with self._lock:
            with self.path.open("a", encoding="utf-8") as f:
                f.writelines(lines)
            self._entry_count += len(lines)

    # --- Read Operations ---

    def iter_entries(self,
                     limit: Optional[int] = None,
                     offset: int = 0,
                     event_filter: Optional[str] = None,
                     threat_only: bool = False) -> Iterator[dict]:
        """
        Reads entries from the log with optional filtering/pagination.
        """
        if not self.path.exists():
            return

        count = 0
        skipped = 0

        with self.path.open("r", encoding="utf-8") as f:
            for raw_line in f:
                raw_line = raw_line.strip()
                if not raw_line:
                    continue
                try:
                    entry = json.loads(raw_line)
                except json.JSONDecodeError:
                    continue

                # Filters
                if event_filter and entry.get("event") != event_filter:
                    continue
                if threat_only and entry.get("verdict") == "allow":
                    continue

                # Pagination
                if skipped < offset:
                    skipped += 1
                    continue

                yield entry
                count += 1
                if limit is not None and count >= limit:
                    break

    def tail(self, n: int = 100) -> List[dict]:
        """Return the last N entries (fast — reads from end)."""
        if not self.path.exists():
            return []
        entries = []
        try:
            with self.path.open("r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            pass
        except Exception:
            return []
        return entries[-n:]

    # --- Export ---

    def to_jsonl_bytes(self) -> bytes:
        """Return the full log as raw bytes (for HTTP download)."""
        if not self.path.exists():
            return b""
        return self.path.read_bytes()

    def to_csv_bytes(self) -> bytes:
        """
        Convert log to CSV bytes for download.
        Columns derived from all keys found in the log.
        """
        entries = list(self.iter_entries())
        if not entries:
            return b"# No audit events recorded\n".encode()

        # Collect all unique keys (ordered: important fields first)
        priority = ["iso_time", "wall_ts", "event", "pid", "comm",
                    "verdict", "threat_level", "src", "dst",
                    "injection_score", "size", "proto"]
        all_keys = list(dict.fromkeys(
            priority + [k for k in entries[0].keys() if k not in priority]
        ))
        # Add any extra keys found in later entries
        for entry in entries[1:]:
            for k in entry:
                if k not in all_keys:
                    all_keys.append(k)

        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=all_keys, extrasaction="ignore")
        writer.writeheader()
        for entry in entries:
            writer.writerow({k: entry.get(k, "") for k in all_keys})
        return buf.getvalue().encode("utf-8")

    # --- Maintenance ---

    def clear(self) -> int:
        """Truncate the log. Returns number of entries cleared."""
        with self._lock:
            count = self._entry_count
            self.path.write_text("")
            self._entry_count = 0
        log.warning("audit_log_cleared", entries_removed=count)
        return count

    @property
    def entry_count(self) -> int:
        return self._entry_count

    @property
    def file_size_bytes(self) -> int:
        try:
            return self.path.stat().st_size
        except FileNotFoundError:
            return 0


# --- Helpers ---

def _iso_now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# Shared singleton instance.
audit_log = AuditLog()
