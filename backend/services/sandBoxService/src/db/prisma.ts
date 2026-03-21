import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma';
import { config } from '../config';

const adapter = new PrismaPg(
    { connectionString: config.DATABASE_URL },
    { schema: 'sandbox_service' },
);

const prisma = new PrismaClient({ adapter });

(async () => {
    try {
        await prisma.$connect();
        console.log('Prisma connected successfully');
    } catch (err) {
        console.error('Prisma connection failed:', err);
    }
})();

export { prisma };
