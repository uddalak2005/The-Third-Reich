import { z } from 'zod';

// ── Zod Schemas ──────────────────────────────────────────────────────────────

export const RegisterKeySchema = z.object({
    realApiKey: z
        .string()
        .min(10, 'API key too short')
        .max(500, 'API key too long'),

    userId: z.string(),

    agentId: z
        .string()
        .min(3, 'Agent ID too short')
        .max(100, 'Agent ID too long'),

    agentName: z
        .string()
        .min(1, 'Agent name required')
        .max(100, 'Agent name too long'),

    provider: z.enum(
        ['openai', 'anthropic', 'stripe', 'custom', 'groq', 'gemini'],
        {
            message:
                'Provider must be one of openai, anthropic, stripe, custom',
        },
    ),

    allowedIntent: z
        .string()
        .min(5, 'Intent description too short')
        .max(500, 'Intent too long'),

    expiresAt: z.iso.datetime().optional(),
});

export type RegisterKeyInput = z.infer<typeof RegisterKeySchema>;

export interface HollowKey {
    userId: string;
    id: string;
    agentId: string;
    name: string;
    agentName: string;
    provider: string;
    allowedIntent: string;
    status: 'ACTIVE' | 'DEACTIVATED' | 'EXPIRED';
    timesUsed: number;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
}

export interface Shard {
    index: number;
    value: bigint;
    hash: string;
}

export interface KeyEvent {
    hollowKeyId: string;
    eventType: 'KEY_ISSUED' | 'KEY_USED' | 'SHARD_REQUESTED' | 'KEY_REVOKED';
    traceId?: string;
    agentId?: string;
    metadata?: Record<string, unknown>;
}
