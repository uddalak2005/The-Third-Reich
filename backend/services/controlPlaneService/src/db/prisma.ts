import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const connectionString = `${config.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
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
