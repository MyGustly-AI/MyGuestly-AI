import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "production"
      ? ["error"]
      : [{ emit: "event", level: "query" }, "warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
  prisma.$on("query", (e) => {
    if (e.duration > 200) {
      console.warn(`[SLOW QUERY] ${e.duration}ms → ${e.query}`);
    }
  });
}

export default prisma;
