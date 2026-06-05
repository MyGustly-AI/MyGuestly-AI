import "dotenv/config";
import env from "../src/config/env.js";
import prisma from "../src/prismaClient.js";
import { PasswordUtil, JwtUtil } from "../src/utils/helpers.js";

// Simple seeder for a host user to test Event CRUD locally
const EMAIL = process.env.SEED_HOST_EMAIL || "host@example.com";
const NAME = process.env.SEED_HOST_NAME || "Seed Host";
const PLAIN_PASSWORD = process.env.SEED_HOST_PASSWORD || "Password123!";

// Safety: never run seeder in production
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run seeder in production (NODE_ENV=production).");
  process.exit(1);
}

// Require JWT secrets for token generation unless explicitly allowed for local dev
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  if (process.env.ALLOW_DEV_SEED !== "true") {
    console.error(
      "JWT_SECRET and JWT_REFRESH_SECRET must be set. To allow dev fallbacks set ALLOW_DEV_SEED=true",
    );
    process.exit(1);
  }
  console.warn(
    "ALLOW_DEV_SEED=true detected: using temporary dev secrets for local testing",
  );
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
}

async function seed() {
  try {
    const hashed = PasswordUtil.hashPassword(PLAIN_PASSWORD);

    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      update: {
        fullName: NAME,
        password: hashed,
        role: "HOST",
        
      },
      create: {
        fullName: NAME,
        email: EMAIL,
        password: hashed,
        role: "HOST",
        
      },
    });

    console.log("Seeded host user:");
    console.log({ id: user.id, email: user.email, fullName: user.fullName });

    // Generate token pair for local testing only when explicitly allowed
    if (process.env.ALLOW_DEV_SEED === "true") {
      const tokens = JwtUtil.generateTokenPair(user.id, user.role);
      console.log("\nUse these credentials in Postman:");
      console.log(`Email: ${EMAIL}`);
      console.log(`Password: ${PLAIN_PASSWORD}`);
      console.log("\nTokens:");
      console.log(JSON.stringify(tokens, null, 2));
    } else {
      console.log(
        "\nTokens are not printed. To print tokens for local testing set ALLOW_DEV_SEED=true and re-run the script.",
      );
    }
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await seed();
