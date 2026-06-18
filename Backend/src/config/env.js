import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5003),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_EMAIL_VERIFICATION_SECRET: z.string().min(1),
  JWT_PASSWORD_RESET_SECRET: z.string().min(1),

  QR_SECRET: z.string().min(1),

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

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Termii SMS
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().default("MyGuestly"),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Optional
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Environment Validation Error:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
export default env;