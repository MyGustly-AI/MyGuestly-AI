import { redis } from "../config/redis.js";
import { logger } from "../infra/loggers/logger.js";

const IDEMPOTENCY_TTL = 60 * 60 * 24;

export const idempotency = (req, res, next) => {
  const key = req.headers["x-idempotency-key"];

  if (!key) {
    return next();
  }

  const redisKey = `idempotency:${key}`;

  redis.get(redisKey)
    .then((cached) => {
      if (cached) {
        const cachedResponse = JSON.parse(cached);
        logger.info("Idempotency cache hit", { key, path: req.path });
        return res.status(cachedResponse.statusCode).json(cachedResponse.body);
      }

      const originalJson = res.json.bind(res);
      res.json = function (body) {
        const data = JSON.stringify({ statusCode: res.statusCode, body });
        redis.set(redisKey, data, "EX", IDEMPOTENCY_TTL)
          .catch((err) => {
            logger.error("Idempotency cache set failed", { key, error: err.message });
          });
        return originalJson(body);
      };

      next();
    })
    .catch((err) => {
      logger.error("Idempotency cache check failed", { key, error: err.message });
      next();
    });
};
