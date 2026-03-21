import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    PORT: z.string().default('3000'),
    KEY_VAULT_URL: z.url(),
    JWT_SECRET: z.string().min(1),
    USER_SERVICE_URL: z.string().default('http://localhost:3003'),
    SANDBOX_SERVICE_URL: z.string().default('http://localhost:3004'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);

    console.log('Tree Error:\n', JSON.stringify(tree, null, 2));

    process.exit(1);
}

export const config = {
    PORT: Number(parsed.data.PORT),
    KEY_VAULT_URL: parsed.data.KEY_VAULT_URL,
    JWT_SECRET: parsed.data.JWT_SECRET,
    USER_SERVICE_URL: parsed.data.USER_SERVICE_URL,
    SANDBOX_SERVICE_URL: parsed.data.SANDBOX_SERVICE_URL
};
