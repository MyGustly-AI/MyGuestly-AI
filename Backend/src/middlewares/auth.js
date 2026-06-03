import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import env from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(
        res,
        "Missing or invalid authorization header",
      );
    }

    const token = authHeader.substring(7);

    if (!env.JWT_SECRET) {
      return ApiResponse.internalError(
        res,
        "Server not configured for authentication: missing JWT_SECRET",
      );
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
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

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `This action requires ${roles.join(" or ")} role`,
      );
    }

    next();
  };
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (!env.JWT_SECRET) return next();
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    next();
  }
};

export default authMiddleware;
