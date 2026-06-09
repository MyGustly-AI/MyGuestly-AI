import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import prisma from "../../config/prisma.js";
import { redis } from "../../config/redis.js";
import { hashPassword, comparePassword } from "../../shared/utils/passwordUtil.js";
import {generateAccessToken, generateRefreshToken, generateEmailVerificationToken, generatePasswordResetToken} from "../../shared/utils/tokenUtils.js";
import { RegistrationWorkflow } from "../../orchestration/RegistrationWorkflow.js";
import { AppError } from "../../shared/utils/AppError.js";
import { EmailJobs } from "../../infra/queues/jobs/emailJobs.js";
import { logger } from "../../infra/logs/logger.js";


// Registration service to create new user and generate tokens
export const registerUser = async (payload) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    let user;
    let isRestored = false;

    if (existingUser) {
        if (existingUser.deletedAt) {
            const hashedPassword = await hashPassword(payload.password);

            logger.info("User account restored", {
                userEmail: payload.email,
                previousDeletedAt: existingUser.deletedAt,
            });

            user = await prisma.user.update({
                where: { email: payload.email },
                data: {
                    fullName: payload.fullName,
                    phone: payload.phone,
                    password: hashedPassword,
                    isVerified: false,
                    deletedAt: null,
                },
            });

            isRestored = true;
        } else {
            throw AppError.conflict("Email already exists");
        }
    } else {
        const hashedPassword = await hashPassword(payload.password);

        user = await prisma.user.create({
            data: {
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                password: hashedPassword,
            },
        });

        logger.info("User registered", {
            userId: user.id,
            email: user.email,
        });
    }

    // Event handling layer for new and existing users
    if (isRestored) {
        logger.info("User restoration workflow started", {
            userId: user.id,
            email: user.email,
        });
        await RegistrationWorkflow.handleUserRestored(user);
    } else {
        logger.info("User registration workflow started", {
            userId: user.id,
            email: user.email,
        });
        await RegistrationWorkflow.handleUserRegistered(user);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await redis.del(`refresh:${user.id}`);

    await redis.set(
        `refresh:${user.id}`,
        refreshToken,
        "EX",
        60 * 60 * 24 * 7
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};



// Service to verify email using tokenized URL and mark user as verified
export const verifyEmail = async (token) => {
    const decoded = jwt.verify(
        token,
        env.JWT_EMAIL_VERIFICATION_SECRET
    );

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });

    if (!user) {
        throw AppError.notFound("User not found");
    }

    if (user.isVerified) {
        return true;
    }

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            isVerified: true,
        },
    });

    return true;
};



// Login service to authenticate user and generate tokens
export const loginUser = async (payload) => {
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
        });
        
        if (!user) {
        logger.warn("Authentication failed", {
            reason: "user_not_found",
            email: payload.email,
        });
        throw AppError.unauthorized("Invalid credentials");
    }

    // Reject login if account has been soft deleted
    if (user.deletedAt) {
        logger.warn("Authentication failed", {
            reason: "account_deleted",
            userId: user.id,
            email: user.email,
        });
        throw AppError.unauthorized("Invalid credentials");
    }

    const validPassword = await comparePassword(payload.password, user.password);

    if (!validPassword) {
        logger.warn("Authentication failed", {
            reason: "invalid_password",
            userId: user.id,
            email: user.email,
        });
        throw AppError.unauthorized("Invalid credentials");
    }

    // Generate JWT access tokens for the authenticated user
    const accessToken = generateAccessToken(user);

    // Generate JWT refresh token and store in Redis with expiration
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis with expiration
    await redis.set(
        `refresh:${user.id}`,
        refreshToken,
        "EX",
        60 * 60 * 24 * 7
    );

    logger.info("User authenticated", {
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            avatarUrl: user.avatarUrl,
        },
        accessToken,
        refreshToken,
    };
};




// Refresh token service to generate new access token using refresh token
export const refreshUserToken = async (refreshToken, oldAccessToken) => {

    // Validate that refresh token is provided
    if (!refreshToken) {
        throw AppError.unauthorized("Refresh token not provided");
    }
    
    // Verify the refresh token and extract user information
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    // Check if the refresh token exists in Redis and is valid
    const storedToken = await redis.get(`refresh:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
        logger.warn("Authentication failed", {
            reason: "invalid_refresh_token",
            userId: decoded?.userId,
        });
        throw AppError.unauthorized("Invalid refresh token");
    }

    // Fetch user from database using decoded user ID
    const user = await prisma.user.findUnique({
            where: {
            id: decoded.userId,
            },
        });

    // Blocklist the old access token if provided
    if (oldAccessToken) {
        const decodedOld = jwt.decode(oldAccessToken);
        if (decodedOld?.exp) {
            const remainingTTL = decodedOld.exp - Math.floor(Date.now() / 1000);
            if (remainingTTL > 0) {
                await redis.set(
                    `blocklist:${oldAccessToken}`,
                    "1",
                    "EX",
                    remainingTTL
                );
            }
        }
    }


    // Generate new access token and refresh token for the user
    const newAccessToken = generateAccessToken(user);

    // Generate new refresh token and store in Redis with expiration
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in Redis with new token and expiration
    await redis.set(
        `refresh:${user.id}`,
        newRefreshToken,
        "EX",
        60 * 60 * 24 * 7
        );

    
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};





// Logout service to invalidate refresh token and blocklist access token
export const logoutUser = async (userId, accessToken) => {
    // Remove refresh token from Redis to invalidate it
    await redis.del(`refresh:${userId}`);

    // Decode token to get remaining TTL for blocklist expiry
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) {
        const remainingTTL = decoded.exp - Math.floor(Date.now() / 1000);
        if (remainingTTL > 0) {
            // Store access token in blocklist until it naturally expires
            await redis.set(
                `blocklist:${accessToken}`,
                "1",
                "EX",
                remainingTTL
            );
        }
    }

    return true;
};




// Service to get current authenticated user details
export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            avatarUrl: true,
            isVerified: true,
            createdAt: true,
            deletedAt: true,
        },
    });

    // Check after query returns, not inside it
    if (!user || user.deletedAt) {
        throw AppError.unauthorized("Account no longer exists");
    }

    // Strip deletedAt before returning to client
    const { deletedAt, ...safeUser } = user;
    return safeUser;
};




// Service to update user profile details
export const updateProfile = async (userId, payload) => {
        return prisma.user.update({
            where: {
                id: userId,
            },

        data: payload,

        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            avatarUrl: true,
        },
        });
};



// Service to change user password
export const changePassword = async (userId, currentPassword, newPassword) => {
    const user =
        await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        
        if (!user) {
        throw AppError.notFound("User not found");
    }

        const valid = await comparePassword(
            currentPassword, user.password
        );

    if (!valid) {
        throw AppError.unauthorized("Current password is incorrect");
    }
        // Hash  new password
        const hashed = await hashPassword(newPassword);

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashed,
        },
        });

        return true;
};




// Forgot password service to generate reset token and send password reset email
export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return true;
    }

    const resetToken = generatePasswordResetToken(user);

    // Send password reset email with tokenized URL
    await EmailJobs.sendPasswordReset({
        to: user.email,
        fullName: user.fullName,
        token: resetToken,
    });

    return true;
};

// Reset password service to validate reset token and update password
export const resetPassword = async (token, newPassword) => {
    const decoded = jwt.verify(token, env.JWT_PASSWORD_RESET_SECRET);

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });

    if (!user) {
        throw AppError.notFound("User not found");
    }

    const hashedPassword =
        await hashPassword(newPassword);

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
        },
    });

    await redis.del(`refresh:${user.id}`);

    return true;
};



// Service to delete user account
export const deleteUserAccount = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || user.deletedAt) {
        throw AppError.notFound("Account not found");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
    });

    logger.info("User account deleted", {
        userId,
        email: user.email,
    });

    // Fire and forget account deletion email
    await EmailJobs.sendAccountDeleted({
        to: user.email,
        fullName: user.fullName,
    }
).catch((err) => {
    logger.error("Failed to send deletion email", {
        userId,
        email: user.email,
        error: err?.message || err,
    });
});
    return true;
};