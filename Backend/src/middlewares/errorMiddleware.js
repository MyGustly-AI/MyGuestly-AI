import {ApiResponse} from "../utils/ApiResponse.js";

/**
 * Error Handling Middleware
 * Catches all errors and formats response
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  // Handle custom AppError
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Handle Joi validation errors
  if (err.details) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Handle Prisma errors
  if (err.code?.startsWith("P")) {
    statusCode = 400;
    message = "Database operation failed";
    if (process.env.NODE_ENV === "development") {
      errors = [err.message];
    }
  }

  return ApiResponse.error(res, message, errors, statusCode);
};
