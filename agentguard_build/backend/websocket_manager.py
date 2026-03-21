"""
Handles the WebSocket connections and broadcasts events.
Channels: events, stats, dashboard.
"""

import asyncio
import json
import time
from typing import Dict, List, Set
from fastapi import WebSocket
import structlog

log = structlog.get_logger()


class WebSocketManager:
    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {
            "events":    set(),
            "stats":     set(),
            "dashboard": set(),
        }
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket, channel: str = "events") -> None:
        await ws.accept()
        async with self._lock:
            self._connections.setdefault(channel, set()).add(ws)
        log.info("ws_connected", channel=channel,
                 total=len(self._connections[channel]))

    def disconnect(self, ws: WebSocket, channel: str = "events") -> None:
        self._connections.get(channel, set()).discard(ws)
        log.info("ws_disconnected", channel=channel,
                 total=len(self._connections.get(channel, set())))

    async def receive_loop(self, ws: WebSocket) -> None:
        """
        Main loop to keep the socket alive. 
        Just handles pings for now - clients should send {"type":"ping"}.
        """
        try:
            while True:
                data = await ws.receive_text()
                try:
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        await ws.send_text(json.dumps({"type": "pong",
                                                       "ts": time.time()}))
                except (json.JSONDecodeError, Exception):
                    pass
        except Exception:
            pass  


    async def broadcast(self, payload: dict, channel: str) -> None:
        """
        Broadcast to everyone on this channel. 
        If a connection is dead, we'll catch it here and drop it.
        """
        message   = json.dumps(payload, default=str)
        dead: List[WebSocket] = []

        conns = set(self._connections.get(channel, set()))
        for ws in conns:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections.get(channel, set()).discard(ws)

    async def broadcast_event(self, event: dict) -> None:
        """Push a single event to /ws/events and /ws/dashboard."""
        payload = {"type": "event", "data": event, "ts": time.time()}
        await self.broadcast(payload, "events")
        await self.broadcast(payload, "dashboard")

    async def broadcast_stats(self, stats: dict) -> None:
        """Push a stats snapshot to /ws/stats and /ws/dashboard."""
        payload = {"type": "stats", "data": stats, "ts": time.time()}
        await self.broadcast(payload, "stats")
        await self.broadcast(payload, "dashboard")

    async def broadcast_alert(self, alert: dict) -> None:
        """Push a high-priority alert to all channels."""
        payload = {"type": "alert", "data": alert, "ts": time.time()}
        for channel in self._connections:
            await self.broadcast(payload, channel)


    async def stats_ticker(self, get_stats_fn, interval: float = 1.0) -> None:
        """
        Background task to push stats every N seconds.
        NOTE: Pass this to asyncio.create_task() in the lifespan handler.
        """
        while True:
            await asyncio.sleep(interval)
            try:
                stats = get_stats_fn()
                if self._connections.get("stats") or \
                   self._connections.get("dashboard"):
                    await self.broadcast_stats(stats)
            except Exception as e:
                log.warning("stats_ticker_error", error=str(e))

#Diagnostics 

    def connection_counts(self) -> dict:
        return {ch: len(conns)
                for ch, conns in self._connections.items()}

ws_manager = WebSocketManager()
