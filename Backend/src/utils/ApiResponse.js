/**
 * Standardized API Response Handler
 * Ensures consistent JSON responses across all endpoints
 */
export class ApiResponse {
  /**
   * Success Response - Generic
   * @param {Object} res - Express response object
   * @param {String} message - Response message
   * @param {Object} data - Response data
   * @param {Number} statusCode - HTTP status code (default: 200)
   */
  static success(res, message = "Success", data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created Response (201)
   * @param {Object} res - Express response object
   * @param {String} message - Success message
   * @param {Object} data - Created resource data
   */
  static created(res, message = "Resource created successfully", data = null) {
    return this.success(res, message, data, 201);
  }

  /**
   * Accepted Response (202)
   * @param {Object} res - Express response object
   * @param {String} message - Acceptance message
   * @param {Object} data - Process data
   */
  static accepted(
    res,
    message = "Request accepted for processing",
    data = null,
  ) {
    return this.success(res, message, data, 202);
  }

  /**
   * No Content Response (204)
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated List Response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {Number} page - Current page number
   * @param {Number} limit - Items per page
   * @param {Number} total - Total items count
   * @param {String} message - Response message
   */
  static paginated(
    res,
    data = [],
    page = 1,
    limit = 10,
    total = 0,
    message = "Data retrieved successfully",
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error Response - Generic
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {String|Array} errors - Error details
   * @param {Number} statusCode - HTTP status code (default: 500)
   */
  static error(
    res,
    message = "Internal Server Error",
    errors = null,
    statusCode = 500,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors: errors
        ? typeof errors === "string"
          ? [errors]
          : Array.isArray(errors)
            ? errors
            : [errors]
        : null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Bad Request Response (400)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {String|Array} errors - Validation errors
   */
  static badRequest(res, message = "Invalid request", errors = null) {
    return this.error(res, message, errors, 400);
  }

  /**
   * Unauthorized Response (401)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, null, 401);
  }

  /**
   * Forbidden Response (403)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, null, 403);
  }

  /**
   * Not Found Response (404)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res, message = "Resource not found") {
    return this.error(res, message, null, 404);
  }

  /**
   * Conflict Response (409)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {String|Array} errors - Conflict details
   */
  static conflict(res, message = "Resource already exists", errors = null) {
    return this.error(res, message, errors, 409);
  }

  /**
   * Unprocessable Entity Response (422)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {String|Array} errors - Validation errors
   */
  static unprocessable(res, message = "Unprocessable entity", errors = null) {
    return this.error(res, message, errors, 422);
  }

  /**
   * Internal Server Error Response (500)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static internalError(res, message = "Internal server error") {
    return this.error(res, message, null, 500);
  }

  /**
   * Service Unavailable Response (503)
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static serviceUnavailable(res, message = "Service temporarily unavailable") {
    return this.error(res, message, null, 503);
  }
}
