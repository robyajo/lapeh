import Redis from "ioredis";

export const useRedis = !!process.env.REDIS_URL;

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis(process.env.REDIS_URL as string, {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
  });
}

const memory = new Map<string, { value: any; expireAt: number }>();

export async function getCache(key: string) {
  if (useRedis && redis) {
    try {
      const v = await redis.get(key);
      return v ? JSON.parse(v) : null;
    } catch {
      // fall through
    }
  } else {
    const entry = memory.get(key);
    if (entry && entry.expireAt > Date.now()) return entry.value;
    if (entry) memory.delete(key);
  }
  return null;
}

export async function setCache(key: string, value: any, ttlSeconds = 60) {
  if (useRedis && redis) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch {
      // fall through
    }
  } else {
    memory.set(key, { value, expireAt: Date.now() + ttlSeconds * 1000 });
  }
}

export async function delCache(key: string) {
  if (useRedis && redis) {
    try {
      await redis.del(key);
      return;
    } catch {
      // fall through
    }
  } else {
    memory.delete(key);
  }
}

export async function pingRedis(): Promise<boolean> {
  if (!useRedis || !redis) return false;
  try {
    await redis.connect();
    const res = await redis.ping();
    return res === "PONG";
  } catch {
    return false;
  }
}

export { redis };
