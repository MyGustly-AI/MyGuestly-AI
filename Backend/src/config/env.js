// Centralized environment variables and validation
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(5003),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    // JWT
    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    JWT_EMAIL_VERIFICATION_SECRET: z.string().min(1),
    JWT_PASSWORD_RESET_SECRET: z.string().min(1),

    // CORS
    ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

    // Email
    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number().default(587),
    EMAIL_SERVICE_USER: z.string().email(),
    EMAIL_SERVICE_PASS: z.string().min(1),

    // App URLs
    APP_CLIENT_URL: z.string().url().default("http://localhost:5173"),
    APP_API_URL: z.string().url().default("http://localhost:5003"),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        "Environment Validation Error",
        parsed.error.flatten().fieldErrors
    );
    process.exit(1);
}

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || null,
  JWT_SECRET: process.env.JWT_SECRET || null,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || null,
  APP_URL:
    process.env.APP_URL || process.env.BASE_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
  EMAIL_HOST: process.env.EMAIL_HOST || null,
  EMAIL_PORT: process.env.EMAIL_PORT
    ? parseInt(process.env.EMAIL_PORT, 10)
    : null,
  EMAIL_SERVICE_USER: process.env.EMAIL_SERVICE_USER || null,
  EMAIL_SERVICE_PASS: process.env.EMAIL_SERVICE_PASS || null,
  EMAIL_FROM: process.env.EMAIL_FROM || null,
  RESEND_API_KEY: process.env.RESEND_API_KEY || null,
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
};

export default env;
