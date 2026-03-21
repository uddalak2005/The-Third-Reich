import {broadcastAttackEvent, broadcastKeyEvent} from "../../websockets/broadCastEvents";

export async function attackHandler(data: any) {
    console.log('[attackHandler] Key event:', data);

    const event = "attack.detected";

    broadcastKeyEvent(event, {
        eventId: data.eventId,
        severity: 'high',
        timestamp: data.timestamp ?? new Date().toISOString(),
        service: 'key-vault',
        payload: data.reason,
    });
}