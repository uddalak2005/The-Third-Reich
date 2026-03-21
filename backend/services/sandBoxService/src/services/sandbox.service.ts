import { executeInSandbox } from '../docker';
import { KafkaProducer } from '../kafka/producer';
import { prisma } from '../db/prisma';
import { ExecuteSandboxInput, ExecutionResult } from '../types';
import { v4 as uuid } from 'uuid';

export async function runSandbox(
    input: ExecuteSandboxInput,
    agentId: string,
    userId: string,
): Promise<ExecutionResult> {
    const eventId = uuid();

    const producer = new KafkaProducer('sandbox-service');

    await producer.connect();

    await producer.publish(
        'sandbox.lifecycle',
        {
            eventId,
            eventType: 'SANDBOX_CREATED',
            agentId,
            userId,
            image: input.image,
            command: input.command,
            intent: input.intent,
        },
        eventId,
    );

    console.log('Sandbox Event Published Successfully');

    const result = await executeInSandbox(
        input.command,
        input.image,
        input.timeoutMs,
    );

    await producer.publish(
        'sandbox.lifecycle',
        {
            eventId: uuid(),
            eventType:
                result.status === 'anomaly'
                    ? 'ANOMALY_DETECTED'
                    : 'SANDBOX_DESTROYED',
            sandboxId: result.sandboxId,
            agentId,
            userId,
            durationMs: result.durationMs,
            exitCode: result.exitCode,
            status: result.status,
            stdout: result.stdout,
        },
        uuid(),
    );

    await prisma.sandboxLog.create({
        data: {
            sandboxId: result.sandboxId,
            agentId,
            userId,
            image: input.image,
            command: input.command,
            intent: input.intent,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            status: result.status,
            durationMs: result.durationMs,
        },
    });

    return result;
}

export async function getSandboxLogs(userId: string) {
    return prisma.sandboxLog.findMany({
        where: { userId },
        orderBy: { executedAt: 'desc' },
        take: 50,
    });
}
