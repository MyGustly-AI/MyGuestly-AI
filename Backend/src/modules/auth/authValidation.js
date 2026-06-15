import { z } from "zod";

// Safe validation schema for user registration input
export const registerSchema = z.object({
    fullName: z.string().min(3).max(100),
    email: z.email(),
    password: z
        .string()
        .min(8)
        .max(64),
    phone: z.string().optional(),
});

// Safe validation schema for user login input
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(64),
});

// Safe validation schema for profile update input
export const updateProfileSchema = z.object({
        fullName: z
        .string()
        .min(3)
        .max(100)
        .optional(),

        phone: z.string().optional(),

        avatarUrl:
        z.string().url().optional(),
});

// Safe validation schema for password change input
export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});

// Safe validation schema for forgot password input
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email(),
});

// Safe validation schema for reset password input
export const resetPasswordSchema = z.object({
    token: z
        .string()
        .min(1),

    newPassword: z
        .string()
        .min(8),
});

// Safe validation schema for Google OAuth login
export const googleAuthSchema = z.object({
    idToken: z.string().min(1),
});