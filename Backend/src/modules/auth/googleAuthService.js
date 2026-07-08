import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import env from "../../config/env.js";
import prisma from "../../config/prisma.js";
import { redis } from "../../config/redis.js";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils/tokenUtils.js";
import { AppError } from "../../shared/utils/AppError.js";
import { logger } from "../../infra/loggers/logger.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function googleLogin(idToken) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw AppError.unauthorized("Invalid Google token");
  }

  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw AppError.badRequest("Google account has no email");
  }

  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  if (!user && email) {
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: picture || user.avatarUrl },
      });
    }
  }

  if (!user) {
    const password = crypto.randomUUID();
    user = await prisma.user.create({
      data: {
        fullName: name || email.split("@")[0],
        email,
        googleId,
        password,
        avatarUrl: picture,
        isVerified: true,
      },
    });

    logger.info("User registered via Google", {
      userId: user.id,
      email: user.email,
    });
  }

  if (user.deletedAt) {
    throw AppError.unauthorized("Account no longer exists");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redis.del(`refresh:${user.id}`);
  await redis.set(
    `refresh:${user.id}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 7,
  );

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
}
