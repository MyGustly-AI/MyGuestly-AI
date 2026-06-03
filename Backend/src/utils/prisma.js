/**
 * Prisma Client Instance
 * Centralized Prisma client for database operations
 */

import pkg from "@prisma/client";
import env from "../config/env.js";

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

const resolveAdapterProvider = (databaseUrl) => {
  if (!databaseUrl) return undefined;
  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    // Prisma's generated client uses activeProvider "postgresql" but the
    // runtime expects adapter.provider to be the normalized name "postgres".
    return "postgres";
  }
  if (databaseUrl.startsWith("mysql://") || databaseUrl.startsWith("mysql2://")) {
    return "mysql";
  }
  // Fallback to postgres for unknown/unspecified DBs to avoid init errors in dev
  return "postgres";
};

const adapterProvider = resolveAdapterProvider(env.DATABASE_URL);

const prismaClient =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter: {
      provider: adapterProvider,
      url: env.DATABASE_URL,
    },
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: env.NODE_ENV === "development" ? "pretty" : "minimal",
  });

if (env.NODE_ENV !== "production") globalForPrisma.prismaClient = prismaClient;

export const prisma = prismaClient;

// Handle Prisma errors
prisma.$on("error", (e) => {
  console.error("Prisma error:", e);
});

export default prisma;
