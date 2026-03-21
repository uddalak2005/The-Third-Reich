import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.enum(['development', 'production']),
    DATABASE_URL: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string(),
    KAFKA_BROKERS: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);

    console.log('Tree Error:\n', JSON.stringify(tree, null, 2));

    process.exit(1);
}

export const config = {
    PORT: Number(parsed.data.PORT),
    NODE_ENV: parsed.data.NODE_ENV,
    DATABASE_URL: parsed.data.DATABASE_URL,
    REDIS_HOST: parsed.data.REDIS_HOST,
    REDIS_PORT: Number(parsed.data.REDIS_PORT),
    KAFKA_BROKERS: parsed.data.KAFKA_BROKERS.split(',') || ['localhost:9092'],
};
