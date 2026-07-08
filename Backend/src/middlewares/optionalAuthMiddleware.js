import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Auth middleware that allows optional authentication
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      req.user = jwt.verify(token, env.JWT_SECRET);
    }
    next();
  } catch {
    next();
  }
};
