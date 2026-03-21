import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.string().default('3002'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379'),
    DATABASE_URL: z.string(),
    KAFKA_BROKERS: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (parsed.error) {
    const tree = z.treeifyError(parsed.error);

    console.error('Tree Error:\n', JSON.stringify(tree, null, 2));

    process.exit(1);
}

export const config = {
    PORT: parsed.data?.PORT,
    NODE_ENV: parsed.data?.NODE_ENV,
    DATABASE_URL: parsed.data?.DATABASE_URL,
    REDIS_HOST: parsed.data?.REDIS_HOST,
    REDIS_PORT: Number(parsed.data?.REDIS_PORT),
    KAFKA_BROKERS: parsed.data?.KAFKA_BROKERS.split(','),
};
