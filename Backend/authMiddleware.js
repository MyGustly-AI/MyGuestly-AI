import jwt from "jsonwebtoken";
import { ApiResponse } from "./src/utils/ApiResponse.js";

/**
 * Authentication Middleware
 * Verifies JWT token from request headers
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(
        res,
        "Missing or invalid authorization header"
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Invalid token");
    }
    return ApiResponse.unauthorized(res, "Authentication failed");
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `This action requires ${roles.join(" or ")} role`
      );
    }

    next();
  };
};

/**
 * Optional Auth Middleware
 * Verifies JWT if present, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Silently ignore auth errors for optional auth
    next();
  }
};

/**
 * Request Logger Middleware
 * Logs incoming requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

/**
 * CORS Middleware Configuration
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * Rate Limiting Middleware (Basic)
 * Can be replaced with express-rate-limit in production
 */
export const createRateLimiter = () => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const timestamps = requests.get(key);
    const recentRequests = timestamps.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        timestamp: new Date().toISOString(),
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Cleanup old entries
    if (requests.size > 1000) {
      const oldestKey = requests.keys().next().value;
      requests.delete(oldestKey);
    }

    next();
  };
};
