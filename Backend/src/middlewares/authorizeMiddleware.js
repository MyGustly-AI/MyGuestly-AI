import { ApiResponse } from "../utils/ApiResponse.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, "Access denied");
    }

    next();
  };
};
