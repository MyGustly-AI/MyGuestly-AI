import morgan from "morgan";
import { logger } from "./logger.js";

const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

// Middleware to log incoming HTTP requests with method, URL, status, and response time
export const requestLogger = morgan(
    ":method :url :status :response-time ms",
    { stream }
);