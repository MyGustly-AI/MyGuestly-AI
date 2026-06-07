/**
 * 404 Not Found Middleware
 * Handles undefined routes
 */
export const notFoundHandler = (req, res) => {
    return ApiResponse.notFound(
        res, `Route ${req.method} ${req.originalUrl} not found`
    );
};
