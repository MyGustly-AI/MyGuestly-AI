/**
 * Centralized environment variables and validation
 */
const requiredInProduction = ["DATABASE_URL", "JWT_SECRET"];

if (process.env.NODE_ENV === "production") {
  for (const key of requiredInProduction) {
    if (!process.env[key]) {
      console.error(`Missing required env var: ${key}`);
      process.exit(1);
    }
  }
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
