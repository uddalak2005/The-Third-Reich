import Redis from 'ioredis';
import { config } from '../config';

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
});

redis.on('connect', () => {
    console.log('Connected to Redis via ioredis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export { redis };
