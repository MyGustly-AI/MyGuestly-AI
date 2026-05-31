/**
 * Prisma Client Instance
 * Centralized Prisma client for database operations
 */

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

export const prisma = new PrismaClient({
  adapter: {
    provider: "postgres",
    url: process.env.DATABASE_URL,
  },
});

// Handle Prisma errors
prisma.$on("error", (e) => {
  console.error("Prisma error:", e);
});

export default prisma;
