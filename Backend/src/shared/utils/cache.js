import { redis } from "../../config/redis.js";

export async function getCachedOrFetch(key, ttlSeconds, fetcher) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const fresh = await fetcher();

  if (fresh !== null && fresh !== undefined) {
    await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  }

  return fresh;
}

export async function invalidateCache(keys) {
  if (keys.length === 0) return;
  await redis.del(...keys);
}
