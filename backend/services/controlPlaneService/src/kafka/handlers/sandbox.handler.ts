import { broadcastSandboxEvent } from "../../websockets/broadCastEvents";

export async function sandboxHandler(data: any) {
    console.log('[sandboxHandler] Sandbox event:', data);

    const event =
        data.eventType === 'SANDBOX_CREATED'
            ? 'sandbox.created'
            : data.eventType === 'SANDBOX_DESTROYED'
                ? 'sandbox.destroyed'
                : data.eventType === 'ANOMALY_DETECTED'
                    ? 'sandbox.anomaly'
                    : 'sandbox.unknown';

    broadcastSandboxEvent(event, {
        eventId: data.eventId,
        severity:
            data.eventType === 'ANOMALY_DETECTED' ? 'high' : 'info',
        timestamp: new Date().toISOString(),
        service: 'sandbox-service',


        payload: {
            sandboxId: data.sandboxId ?? null,
            agentId: data.agentId,
            userId: data.userId,
            image: data.image ?? null,
            command: data.command ?? null,
            intent: data.intent ?? null,
            durationMs: data.durationMs ?? null,
            exitCode: data.exitCode ?? null,
            status: data.status ?? null,
            stdout: data.stdout ?? null,
        },
    });
}