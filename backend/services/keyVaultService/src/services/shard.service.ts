import { redis } from '../db/redis';
import { prisma } from '../db/prisma'; // use Prisma instead of raw pg
import * as shamir from '../crypto/shamir';
import { AppError } from '../error/AppError';
import { Shard } from '../types';
import { Prisma } from '@prisma/client/extension';

const VAULT_PREFIXES = [
    'vault:1',
    'vault:2',
    'vault:3',
    'vault:4',
    'vault:5',
] as const;

const SHARD_TTL_SECONDS = 24 * 60 * 60; // 1 hour for local testing
const SHARD_LOCATION_CACHE_TTL = 60 * 5; // 5 minutes

interface ShardLocation {
    shardIndex: number;
    vaultLocation: string;
    shardHash: string;
}

export async function distribute(
    shards: Shard[],
    hollowKeyId: string,
    tx: Prisma.TransactionClient,
): Promise<void> {
    await Promise.all(
        shards.map(async (shard) => {
            const prefix = VAULT_PREFIXES[shard.index - 1];
            const redisKey = `${prefix}:${hollowKeyId}:${shard.index}`;

            // store shard value in Redis
            await redis.setex(
                redisKey,
                SHARD_TTL_SECONDS,
                shard.value.toString(),
            );

            // store shard location in Postgres (Prisma)
            await tx.keyShard.create({
                data: {
                    hollowKeyId: hollowKeyId,
                    shardIndex: shard.index,
                    vaultLocation: redisKey,
                    shardHash: shard.hash,
                },
            });
        }),
    );

    // warm location cache
    await warmLocationCache(hollowKeyId, tx);
}

export async function fetchShards(
    hollowKeyId: string,
    threshold = 3,
): Promise<Shard[]> {
    const locations = await getLocations(hollowKeyId);

    if (locations.length < threshold) {
        throw new AppError(
            `Only ${locations.length} shards found, need ${threshold}`,
            'THRESHOLD_NOT_MET',
            503,
        );
    }

    const selected = locations.slice(0, threshold);

    const shards = await Promise.all(
        selected.map(async (loc) => {
            const raw = await redis.get(loc.vaultLocation);
            if (!raw)
                throw new AppError(
                    `Shard ${loc.shardIndex} missing`,
                    'SHARD_NOT_FOUND',
                    503,
                );

            const shard: Shard = {
                index: loc.shardIndex,
                value: BigInt(raw),
                hash: loc.shardHash,
            };
            if (!shamir.verifyShard(shard)) {
                throw new AppError(
                    `Shard ${loc.shardIndex} integrity failed`,
                    'SHARD_INTEGRITY_FAILED',
                    500,
                );
            }
            return shard;
        }),
    );

    return shards;
}

export async function getLocations(
    hollowKeyId: string,
): Promise<ShardLocation[]> {
    const cacheKey = `shardlocations:${hollowKeyId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const rows = await prisma.keyShard.findMany({
        where: { hollowKeyId: hollowKeyId },
        orderBy: { shardIndex: 'asc' },
    });

    if (!rows.length)
        throw new AppError(`No shards found`, 'SHARDS_NOT_FOUND', 404);

    const locations: ShardLocation[] = rows.map((r) => ({
        shardIndex: r.shardIndex, // ← was r.shardIndex (wrong)
        vaultLocation: r.vaultLocation, // ← was r.vaultLocation (wrong)
        shardHash: r.shardHash, // ← was r.shardHash (wrong)
    }));

    await redis.setex(
        cacheKey,
        SHARD_LOCATION_CACHE_TTL,
        JSON.stringify(locations),
    );
    return locations;
}

export async function deleteShards(hollowKeyId: string): Promise<void> {
    const locations = await getLocations(hollowKeyId).catch(() => []);

    if (locations.length > 0) {
        await Promise.all(locations.map((loc) => redis.del(loc.vaultLocation)));
    }

    await prisma.keyShard.deleteMany({
        where: { hollowKeyId: hollowKeyId },
    });
    await redis.del(`shardlocations:${hollowKeyId}`);
}

export async function warmLocationCache(
    hollowKeyId: string,
    tx: Prisma.TransactionClient,
) {
    console.log(`Hollow key has expired: '${hollowKeyId}'`);

    const key = await tx.HollowKey.findUnique({
        where: { id: hollowKeyId },
    });

    console.log(key);

    const locations = await tx.keyShard.findMany({
        where: { hollowKeyId: hollowKeyId },
        orderBy: { shardIndex: 'asc' },
    });

    console.log('Locations : ', locations);

    const cache: ShardLocation[] = locations.map((r: any) => ({
        shardIndex: r.shardIndex, // ← was r.shardIndex (wrong)
        vaultLocation: r.vaultLocation, // ← was r.vaultLocation (wrong)
        shardHash: r.shardHash, // ← was r.shardHash (wrong)
    }));

    await redis.setex(
        `shardlocations:${hollowKeyId}`,
        SHARD_LOCATION_CACHE_TTL,
        JSON.stringify(cache),
    );
}
