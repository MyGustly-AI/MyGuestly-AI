import { logger } from "./logger.js";

// Middleware to log errors with detailed information
export const errorLogger = (
    err,
    req,
    res,
    next
) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    next(err);
};