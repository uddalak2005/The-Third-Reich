import { Request, Response } from 'express';
import {HollowKey, RegisterKeySchema} from '../types';

import {
    registerKey,
    listKeys,
    findById,
    revokeKey,
} from '../services/key.service';
import { z } from 'zod';
import { AppError } from '../error/AppError';
import { prisma } from '../db/prisma';
import { fetchShards } from '../services/shard.service';
import { executeInEnclave } from '../crypto/enclave';
import {checkIntent} from "../proto/intentFirewall.client";

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

class KeyController {

    /*
     * Create New Keys and Split it via Shamir's Algorithm
     * Store the keys and the shards
     */
    async createKey(req: Request, res: Response) {
        try {
            console.log(req.body);
            const parsed = RegisterKeySchema.safeParse(req.body);

            if (parsed.error) {
                const tree = z.treeifyError(parsed.error);

                console.log('Tree Error:\n', JSON.stringify(tree, null, 2));

                res.status(400).json({
                    error: parsed.error,
                });

                return;
            }

            console.log(parsed.data);

            const hollowKey = await registerKey(parsed.data);


            res.status(200).json({
                message: 'Success',
                hollowKey,
            });
        } catch (err) {
            const error = err as AppError;
            console.log(error);
            res.status(400).json({
                error: error.message,
            });
        }
    }

    /*
     * Get the keys of a Particular User
     */
    async getKeys(req: Request, res: Response) {
        try {
            const userId = req.headers['x-user-id'] as string;

            const keys = await listKeys(userId);

            return res.status(200).json({
                success: true,
                keys,
                total: keys.length,
            });
        } catch (err) {
            const error = err as AppError;
            console.log(error);
            res.status(400).json({
                error: error.message,
            });
        }
    }

    /*
     * Get keys by ID
     */
    async getOne(req: Request, res: Response) {
        try {
            const key = await findById(req.params.id as string);

            if (!key) {
                return res.status(404).json({
                    code: 'KEY_NOT_FOUND',
                    message: `No hollow key found with id ${req.params.id}`,
                });
            }

            return res.status(200).json({ success: true, key });
        } catch (err) {
            const error = err as AppError;
            console.log(error);
            res.status(400).json({
                error: error.message,
            });
        }
    }
    /*
     * Revoke Keys by ID
     */
    async revoke(req: AuthRequest, res: Response) {
        try {
            const userId = req.headers['x-user-id'] as string;
            /*
             * keyService checks that this agentId owns the key
             * Throws if not found or already revoked
             */
            await revokeKey(req.params.id as string, userId as string);

            return res.status(200).json({
                success: true,
                message: 'Hollow key revoked successfully',
            });
        } catch (err) {
            const error = err as AppError;
            console.log(error);
            res.status(400).json({
                error: error.message,
            });
        }
    }

    async executeInEnclave(req: Request, res: Response) {
        const { url, method, headers, body, keyHeader, hollowKeyId, intent } =
            req.body;

        console.log(req.body);

        const hollowKey = await findById(hollowKeyId);

        console.log(hollowKey);

        if (!hollowKey) {
            throw new AppError('HollowKey not found', 'KEY_NOT_FOUND', 404);
        }

        if (hollowKey.status !== 'ACTIVE') {
            throw new AppError('HollowKey is not active', 'KEY_REVOKED', 403);
        }

        if (hollowKey.expiresAt && hollowKey.expiresAt < new Date()) {
            throw new AppError('HollowKey has expired', 'KEY_EXPIRED', 403);
        }

        const approved = await checkIntent(JSON.stringify(body), intent);
        console.log(approved);

        if (!approved) {
            // Log the blocked attempt
            await prisma.keyEvent.create({
                data: {
                    hollowKeyId,
                    eventType: 'INTENT_BLOCKED',
                    metadata: JSON.stringify({
                        intent,
                        url,
                        method,
                        blockedAt: new Date(),
                    }),
                },
            })

            throw new AppError(
                'Intent Firewall blocked this request',
                'INTENT_VIOLATION',
                403
            )
        }


        const shards = await fetchShards(hollowKeyId);

        const result = await executeInEnclave(shards, {
            url,
            method,
            headers,
            body,
            keyHeader,
            hollowKeyId,
        });

        await prisma.hollowKey.update({
            where: { id: hollowKeyId },
            data: {
                timesUsed: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });

        await prisma.keyEvent.create({
            data: {
                hollowKeyId,
                eventType: 'CALL',
                metadata: JSON.stringify({
                    intent,
                    url,
                    method,
                    status: result.status,
                    latency: result.latency,
                }),
            },
        });

        res.status(200).json({
            status: result.status,
            body: result.body,
            latency: result.latency,
        });
    }
}

export default new KeyController();
