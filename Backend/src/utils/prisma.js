/**
 * Prisma Client Instance
 * Centralized Prisma client for database operations
 */

import pkg from "@prisma/client";
import env from "../config/env.js";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

// Diagnostic: try to detect what the generated client expects
try {
  const generatedPath = path.join(
    process.cwd(),
    "node_modules",
    "@prisma",
    "client",
    ".prisma",
    "client",
    "internal",
    "class.ts",
  );
  if (fs.existsSync(generatedPath)) {
    const cls = fs.readFileSync(generatedPath, "utf8");
    const m = cls.match(/"activeProvider":\s*"([a-zA-Z0-9_-]+)"/);
    if (m) {
      console.info("Prisma generated client activeProvider:", m[1]);
    }
  }
} catch (e) {
  // ignore diagnostics failures
}

console.info(
  "Prisma DATABASE_URL:",
  env.DATABASE_URL ? env.DATABASE_URL.split("?")[0] : env.DATABASE_URL,
);

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prismaClient =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter,
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
