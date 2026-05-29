import { ApiResponse } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";

/**
 * Base Controller Class
 * Provides common response methods for all controllers
 * Ensures consistent API response formatting
 */
export class BaseController {
  /**
   * Handle successful response
   */
  success(res, message = "Success", data = null, statusCode = 200) {
    return ApiResponse.success(res, message, data, statusCode);
  }

  /**
   * Handle created response (201)
   */
  created(res, message = "Resource created successfully", data = null) {
    return ApiResponse.created(res, message, data);
  }

  /**
   * Handle accepted response (202)
   */
  accepted(res, message = "Request accepted for processing", data = null) {
    return ApiResponse.accepted(res, message, data);
  }

  /**
   * Handle no content response (204)
   */
  noContent(res) {
    return ApiResponse.noContent(res);
  }

  /**
   * Handle paginated response
   */
  paginated(
    res,
    data = [],
    page = 1,
    limit = 10,
    total = 0,
    message = "Data retrieved successfully"
  ) {
    return ApiResponse.paginated(res, data, page, limit, total, message);
  }

  /**
   * Handle error response
   */
  error(res, message = "Error", errors = null, statusCode = 500) {
    return ApiResponse.error(res, message, errors, statusCode);
  }

  /**
   * Handle bad request (400)
   */
  badRequest(res, message = "Invalid request", errors = null) {
    return ApiResponse.badRequest(res, message, errors);
  }

  /**
   * Handle unauthorized (401)
   */
  unauthorized(res, message = "Unauthorized access") {
    return ApiResponse.unauthorized(res, message);
  }

  /**
   * Handle forbidden (403)
   */
  forbidden(res, message = "Access forbidden") {
    return ApiResponse.forbidden(res, message);
  }

  /**
   * Handle not found (404)
   */
  notFound(res, message = "Resource not found") {
    return ApiResponse.notFound(res, message);
  }

  /**
   * Handle conflict (409)
   */
  conflict(res, message = "Resource already exists", errors = null) {
    return ApiResponse.conflict(res, message, errors);
  }

  /**
   * Handle unprocessable entity (422)
   */
  unprocessable(res, message = "Unprocessable entity", errors = null) {
    return ApiResponse.unprocessable(res, message, errors);
  }

  /**
   * Handle internal server error (500)
   */
  internalError(res, message = "Internal server error") {
    return ApiResponse.internalError(res, message);
  }

  /**
   * Wrap controller method with error handling
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Get pagination parameters from request
   */
  getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }
}
