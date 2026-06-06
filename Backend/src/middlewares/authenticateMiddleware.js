import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {redis} from "../config/redis.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(res, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    // Check if token has been blocklisted via logout
    const isBlocklisted = await redis.get(`blocklist:${token}`);
    if (isBlocklisted) {
        return ApiResponse.unauthorized(res, "Session expired, please login again");
    }
    // Verify token and extract user info
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return ApiResponse.unauthorized(res, "Invalid token");
  }
};
