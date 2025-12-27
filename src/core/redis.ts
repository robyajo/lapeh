import Redis from "ioredis";
// @ts-ignore
import RedisMock from "ioredis-mock";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create a wrapper to handle connection attempts
let redis: Redis;
let isRedisConnected = false;

// If explicitly disabled via env
if (process.env.NO_REDIS === "true") {
  console.log("Redis disabled via NO_REDIS, using in-memory mock.");
  redis = new RedisMock();
  isRedisConnected = true;
} else {
  // Try to connect to real Redis
  redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Retry 3 times then give up
      if (times > 3) return null;
      return 200;
    },
  });
}

redis.on("ready", () => {
  isRedisConnected = true;
  // console.log("Redis connected!");
});

redis.on("error", (_err) => {
  // If connection fails and we haven't switched to mock yet
  if (!isRedisConnected && !(redis instanceof RedisMock)) {
    // console.log("Redis connection failed, switching to in-memory mock...");
    // Replace the global redis instance with mock
    // Note: This is a runtime switch. Existing listeners might be lost if we don't handle carefully.
    // However, for a simple fallback, we can just use the mock for future calls.
    // Better approach: Since we exported 'redis' as a const (reference), we can't reassign it easily
    // if other modules already imported it.
    // BUT, ioredis instance itself is an EventEmitter.
    // Strategy: We keep 'redis' as the main interface.
    // If real redis fails, we just don't set isRedisConnected to true for the *real* one.
    // But wait, the user wants 'bundle redis'.
    // The best way is to detect failure during init and SWAP the implementation.
  }
  isRedisConnected = false;
});

// We need a way to seamlessly switch or just default to Mock if connect fails.
// Since 'redis' is exported immediately, we can't easily swap the object reference for importers.
// PROXY APPROACH:
// We export a Proxy that forwards to real redis OR mock redis.

const mockRedis = new RedisMock();
let activeRedis = redis; // Start with real redis attempt

// Custom init function to determine which one to use
export async function initRedis() {
  if (process.env.NO_REDIS === "true") {
    activeRedis = mockRedis;
    console.log("✅ Redis: Active (Source: Zero-Config Redis [NO_REDIS=true])");
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  WARNING: Running in PRODUCTION with in-memory Redis mock. Data will be lost on restart and not shared between instances."
      );
    }
    return;
  }

  try {
    await redis.connect();
    activeRedis = redis; // Keep using real redis
    isRedisConnected = true;

    // Determine source label
    const sourceLabel = process.env.REDIS_URL
      ? redisUrl
      : "Zero-Config Redis (Localhost)";

    console.log(`✅ Redis: Active (Source: ${sourceLabel})`);
  } catch (err) {
    // Connection failed, switch to mock
    console.log(
      `⚠️  Redis: Connection failed to ${redisUrl}, switching to fallback (Source: Zero-Config Redis [Mock])`
    );
    activeRedis = mockRedis;
    isRedisConnected = true; // Mock is always "connected"
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  WARNING: Redis connection failed in PRODUCTION. Switched to in-memory mock. Data will be lost on restart."
      );
    }
  }
}

// Proxy handler to forward all calls to activeRedis
const redisProxy = new Proxy({} as Redis, {
  get: (_target, prop) => {
    // If accessing a property on the proxy, forward it to activeRedis
    const value = (activeRedis as any)[prop];
    return value;
  },
});

export async function getCache(key: string) {
  try {
    const v = await activeRedis.get(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 60) {
  try {
    await activeRedis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {}
}

export async function delCache(key: string) {
  try {
    await activeRedis.del(key);
  } catch {}
}

// Export the proxy as 'redis' so consumers use it transparently
export { redisProxy as redis };
