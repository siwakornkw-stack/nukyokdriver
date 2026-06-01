import redis, { connectRedis, disconnectRedis } from './redisClient';

export async function setCache(key: string, value: any, expiresInSeconds: number = 60) {
  try {
    await connectRedis();
    await redis.set(key, value);
    await redis.expire(key, expiresInSeconds);
    console.log(`INFO: [Cache Set] Key: ${key}`); 
  } catch (err) {
    console.error('ERROR: [Cache Set] :', key);
  } 
}

export async function getCache(key: string) {
  try {
    await connectRedis();
    const value = await redis.get(key);
    console.log(`INFO: [Cache Get] Key: ${key}`);
    return value;
  } catch (err) {
    console.warn('WARN: [Cache Get] Not Found:', key);
    return null;
  }
}
