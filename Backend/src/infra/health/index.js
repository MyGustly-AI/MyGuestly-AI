import { redis } from "../../config/redis.js";
import prisma from "../../shared/utils/prisma.js";
import env from "../../config/env.js";

export async function deepHealthCheck() {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  try {
    await redis.ping();
    checks.services.redis = { status: "ok" };
  } catch (err) {
    checks.services.redis = { status: "error", message: err.message };
    checks.status = "degraded";
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = { status: "ok" };
  } catch (err) {
    checks.services.database = { status: "error", message: err.message };
    checks.status = "degraded";
  }

  checks.services.server = {
    status: "ok",
    port: env.PORT,
    environment: env.NODE_ENV,
  };

  return checks;
}
