import { z } from 'zod';

export const ExecuteSandboxSchema = z.object({
    command: z.array(z.string()).min(1),
    image: z
        .enum(['alpine:latest', 'python:3.11-alpine', 'node:20-alpine'])
        .default('alpine:latest'),
    timeoutMs: z.number().min(100).max(30000).default(5000),
    intent: z.string().min(3).max(500),
});

export type ExecuteSandboxInput = z.infer<typeof ExecuteSandboxSchema>;

export type SandboxStatus = 'completed' | 'failed' | 'timeout' | 'anomaly';

export interface ExecutionResult {
    sandboxId: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
    status: SandboxStatus;
}

export const SUSPICIOUS_PATTERNS = [
    /\/etc\/passwd/,
    /\/etc\/shadow/,
    /rm\s+-rf/,
    /curl\s+/,
    /wget\s+/,
    /base64\s+-d/,
];
