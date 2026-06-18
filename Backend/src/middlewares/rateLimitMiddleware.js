import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

// Redis rate limiting middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

// Login specific rate limiter to prevent brute-force attacks on authentication endpoints
export const loginLimiter = rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 5,

    message:
      "Too many login attempts",
  });