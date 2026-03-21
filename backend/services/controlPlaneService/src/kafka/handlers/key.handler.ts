import { broadcastKeyEvent } from '../../websockets/broadCastEvents';

export async function keyHandler(data: any) {
    console.log('[keyHandler] Key event:', data);

    const event =
        data.action === 'KEY_ISSUED'
            ? 'key.issued'
            : data.eventType === 'KEY_REVOKED'
              ? 'key.revoked'
              : 'key.used';

    broadcastKeyEvent(event, {
        eventId: data.eventId,
        severity: 'info',
        timestamp: data.timestamp ?? new Date().toISOString(),
        service: 'key-vault',
        payload: data,
    });
}
