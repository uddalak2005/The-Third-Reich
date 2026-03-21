"""
Three live-streaming endpoints for the React dashboard.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket_manager import ws_manager

ws_router = APIRouter(tags=["websocket"])


@ws_router.websocket("/ws/events")
async def websocket_events(ws: WebSocket):
    """
    format:   {"type": "event", "ts": 1234567890.123, "data": {
      "ts": ..., "event": "prompt_injection", "pid": 1234,
      "comm": "python3", "src": "proxy", "dst": "api.openai.com:443",
      "verdict": "block", "threat_level": 3,
      "injection_score": 65, "injection_patterns": ["ignore-all-previous"]
  }}


    Stream every security event in real-time.
    Connect here to build a live event log in the dashboard.
    """
    await ws_manager.connect(ws, channel="events")
    try:
        await ws_manager.receive_loop(ws)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, channel="events")


@ws_router.websocket("/ws/stats")
async def websocket_stats(ws: WebSocket):
    """
    format:   {"type": "stats", "ts": 1234567890.123, "data": {
      "packets_seen": 1024, "packets_blocked": 3,
      "injections_found": 1, "syscalls_blocked": 0,
      "agents_tracked": 2, "kills_issued": 0
  }}    

    Stream a stats snapshot every second.
    Connect here to update live counters/charts.
    """
    await ws_manager.connect(ws, channel="stats")
    try:
        await ws_manager.receive_loop(ws)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, channel="stats")


@ws_router.websocket("/ws/dashboard")
async def websocket_dashboard(ws: WebSocket):
    """
    format:   {"type": "alert", "ts": ..., "data": {
      "severity": "critical", "message": "C2 callback detected",
      "pid": 5678, "agent": "python3"
  }}    
    Combined feed — events + stats in one connection.
    Recommended for the React dashboard (single WS, two message types).
    """
    await ws_manager.connect(ws, channel="dashboard")
    try:
        await ws_manager.receive_loop(ws)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, channel="dashboard")
