import Redis from "ioredis";
import env from "./env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});
