/**
 * Custom Application Error Class
 * Extends Error to provide structured error handling
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Static method for Bad Request (400)
   */
  static badRequest(message, errors = null) {
    return new AppError(message, 400, errors);
  }

  /**
   * Static method for Unauthorized (401)
   */
  static unauthorized(message = "Unauthorized access") {
    return new AppError(message, 401);
  }

  /**
   * Static method for Forbidden (403)
   */
  static forbidden(message = "Access forbidden") {
    return new AppError(message, 403);
  }

  /**
   * Static method for Not Found (404)
   */
  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  /**
   * Static method for Conflict (409)
   */
  static conflict(message, errors = null) {
    return new AppError(message, 409, errors);
  }

  /**
   * Static method for Unprocessable Entity (422)
   */
  static unprocessable(message, errors = null) {
    return new AppError(message, 422, errors);
  }

  /**
   * Static method for Internal Server Error (500)
   */
  static internalError(message = "Internal server error") {
    return new AppError(message, 500);
  }

  /**
   * Static method for Service Unavailable (503)
   */
  static serviceUnavailable(message = "Service temporarily unavailable") {
    return new AppError(message, 503);
  }

  /**
   * Convert error to JSON
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      timestamp: this.timestamp,
    };
  }
}
