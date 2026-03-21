import { split } from '../crypto/shamir';
import { redis } from '../db/redis';
import { prisma } from '../db/prisma';
import { HollowKey, RegisterKeyInput } from '../types';
import { deleteShards, distribute } from './shard.service';
import { AppError } from '../error/AppError';
import { Prisma } from '@prisma/client/extension';

import { KafkaProducer } from '../kafka/producer';
import { TOPICS } from '../kafka';
import { v4 as uuidv4 } from 'uuid';

const KEY_CACHE_TTL = 300;

/*
 * Create an Event and Publish to Kafka using the KafkaProducer Class
 */
async function publishKeyRegistration(
    hollowKey: HollowKey,
    action: string,
): Promise<void> {
    const producer = new KafkaProducer('key-service');

    await producer.connect();

    const keyEvent = {
        eventId: uuidv4(),
        keyId: uuidv4(),
        userId: hollowKey.userId,
        name: hollowKey.name,
        action: action,
        issuedAt: new Date().toISOString(),
        service: 'key-service',
    };

    await producer.publish(
        TOPICS.HOLLOW_KEY_EVENTS,
        keyEvent,
        keyEvent.eventId,
    );

    console.log('Key Event Published Successfully');

    await producer.disconnect();
}

export async function registerKey(data: RegisterKeyInput) {
    try {
        const shards = split(data.realApiKey);

        const hollowKey = await prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
                const key = await tx.hollowKey.create({
                    data: {
                        agentId: data.agentId,
                        agentName: data.agentName,
                        userId: data.userId,
                        name: data.name,
                        provider: data.provider,
                        allowedIntent: data.allowedIntent,
                        expiresAt: data.expiresAt,
                        status: 'ACTIVE',
                    },
                });

                await distribute(shards, key.id, tx);

                await publishKeyRegistration(key, 'KEY_ISSUED');

                return key;
            },
        );

        data.realApiKey = '\0'.repeat(data.realApiKey.length);

        await redis.setex(
            `hollowkey:${hollowKey.id}`,
            KEY_CACHE_TTL,
            JSON.stringify(hollowKey),
        );
        await redis.del(`hollowkeys:agent:${data.userId}`);

        return hollowKey;
    } catch (err) {
        console.log(err);
    }
}

export async function findById(id: string): Promise<HollowKey | null> {
    const cached = await redis.get(`hollowkey:${id}`);
    if (cached) return JSON.parse(cached);

    const key = await prisma.hollowKey.findUnique({ where: { id } });
    if (!key) return null;

    const hollowKey: HollowKey = {
        id: key.id,
        agentId: key.agentId ?? '',
        userId: key.userId ?? '',
        name: key.name ?? '',
        agentName: key.agentName ?? '',
        provider: key.provider,
        allowedIntent: key.allowedIntent,
        status: key.status,
        timesUsed: key.timesUsed,
        lastUsedAt: key.lastUsedAt ?? null,
        expiresAt: key.expiresAt ?? null,
        createdAt: key.createdAt,
    };

    await redis.setex(`hollowkey:${id}`, KEY_CACHE_TTL, JSON.stringify(key));
    return hollowKey;
}

export async function listKeys(userId: string): Promise<HollowKey[]> {
    const cacheKey = `hollowkeys:agent:${userId}`;

    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const keys = await prisma.hollowKey.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    const result: HollowKey[] = keys.map((key: any) => ({
        userId: key.userId ?? '',
        id: key.id,
        agentId: key.agentId,
        name: key.name,
        agentName: key.agentName,
        provider: key.provider,
        allowedIntent: key.allowedIntent,
        status: key.status,
        timesUsed: key.timesUsed,
        lastUsedAt: key.lastUsedAt ?? null,
        expiresAt: key.expiresAt ?? null,
        createdAt: key.createdAt,
    }));

    // cache it
    await redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
}

export async function revokeKey(id: string, userId: string): Promise<void> {
    const key = await findById(id);

    if (!key) {
        throw new AppError(`Hollow key ${id} not found`, 'KEY_NOT_FOUND', 404);
    }

    if (key.userId !== userId) {
        throw new AppError('You do not own this hollow key', 'FORBIDDEN', 403);
    }

    if (key.status === 'DEACTIVATED') {
        throw new AppError(
            `Hollow key ${id} is already revoked`,
            'ALREADY_REVOKED',
            409,
        );
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
        throw new AppError(`Hollow key ${id} has expired`, 'KEY_EXPIRED', 403);
    }

    try {
        await prisma.hollowKey.update({
            where: {
                id: key.id,
            },
            data: {
                status: 'DEACTIVATED',
            },
        });

        await deleteShards(key.id);
    } catch (err) {
        console.error(err);
        throw err;
    }
}
