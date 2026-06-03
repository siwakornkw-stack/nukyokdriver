import { createClient } from 'redis';

// Prefer a single connection URL (e.g. Upstash: rediss://default:<token>@host:port).
// Falls back to discrete host/port/password env vars for a self-hosted Redis.
//
// On Vercel (serverless) a dead Redis must fail fast: without a bounded
// reconnectStrategy + connectTimeout, redis.connect() retries until the
// function hits its execution limit and returns 504. Giving up after a few
// quick attempts lets callers' try/catch fall through (Redis is best-effort).
const failFastSocket = {
    connectTimeout: 2000,
    reconnectStrategy: (retries: number) => (retries > 2 ? false : Math.min(retries * 200, 600)),
};

const redis = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL, socket: failFastSocket })
    : createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            ...failFastSocket,
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
