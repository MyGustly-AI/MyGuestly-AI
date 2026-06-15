import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = "logs";

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === "production";

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
        ({ level, message, timestamp, stack }) =>
            `${timestamp} ${level}: ${stack || message}`
    )
);

const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create the logger instance with appropriate transports and formats
export const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",

    format: jsonFormat,

    defaultMeta: {
        service: "myguestly-api",
    },

    transports: [
        new winston.transports.Console({
            format: isProduction
                ? jsonFormat
                : consoleFormat,
        }),

        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),

        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
    ],

    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(
                logDir,
                "exceptions.log"
            ),
        }),
    ],

    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(
                logDir,
                "rejections.log"
            ),
        }),
    ],
});