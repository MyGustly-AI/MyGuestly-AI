import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  if (err.details) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.code?.startsWith("P")) {
    statusCode = 400;
    message = "Database operation failed";
    if (process.env.NODE_ENV === "development") {
      errors = [err.message];
    }
  }

  return ApiResponse.error(res, message, errors, statusCode);
};

export default errorHandler;
