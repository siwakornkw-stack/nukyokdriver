import { createClient } from 'redis';

// Prefer a single connection URL (e.g. Upstash: rediss://default:<token>@host:port).
// Falls back to discrete host/port/password env vars for a self-hosted Redis.
const redis = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
    });
/* 
redis.on('connect', () => {
  console.log('Connected to Redis Cloud');
});
 */
redis.on('error', (err) => {
  console.error('ERROR: Redis Connected Error', err);
});

export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};

export const disconnectRedis = async () => {
    if (redis.isOpen) {
        await redis.disconnect();
    }
};

export default redis;
