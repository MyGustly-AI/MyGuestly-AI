import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Generate JWT access token with user payload
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            email: user.email,
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }
    );
};

// Generate JWT refresh token with user payload
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            email: user.email,
        },
        env.JWT_REFRESH_SECRET,
        {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }
    );
};

export const generateEmailVerificationToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            purpose: "email_verification",
        },
        env.JWT_EMAIL_VERIFICATION_SECRET,
        {expiresIn: "24h",}
    );
};

export const generatePasswordResetToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            purpose: "password_reset",
        },
        env.JWT_PASSWORD_RESET_SECRET,
        {expiresIn: "1h",}
    );
};