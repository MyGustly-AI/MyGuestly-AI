import 'dotenv/config'; // Must be the very first line
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import corsMiddleware from "./config/cors.js";
import routes from "./routes/index.js";
import { requestLogger } from "./infra/loggers/requestLogger.js";
import { errorLogger } from "./infra/loggers/errorLogger.js";
import { apiLimiter } from "./middlewares/rateLimitMiddleware.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { notFoundHandler } from "./middlewares/notFoundMiddleware.js";
import { metricsMiddleware, metricsHandler } from "./infra/metrics/index.js";
import { deepHealthCheck } from "./infra/health/index.js";

const app = express(); // Init express ap

app.use(cookieParser()); // Middleware to parse refresh token from cookies for authentication
app.use(helmet()); // Middleware to set security-related HTTP headers for protection against common vulnerabilities
app.use(corsMiddleware); // Middleware to enable CORS for frontend-backend communication in development and production environments

app.use(express.json()); // Middleware to parse JSON request bodies for API endpoints
// Middleware to parse URL-encoded request bodies for form submissions and other non-JSON payloads
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(requestLogger); // Middleware to log incoming requests for debugging and monitoring purposes
app.use(apiLimiter); // Middleware to limit the number of requests from a single IP address
app.use(errorLogger); // Middleware to log errors that occur during request processing for debugging and monitoring purposes

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

app.get("/api/v1/health/deep", async (req, res) => {
  const result = await deepHealthCheck();
  const httpStatus = result.status === "ok" ? 200 : 503;
  res.status(httpStatus).json(result);
});

app.get("/api/v1/metrics", metricsHandler);
app.use(metricsMiddleware);

app.use("/api/v1", routes); // Main API routes
app.use(notFoundHandler); // Middleware to handle 404 Not Found errors for undefined routes
app.use(errorHandler); // Middleware to handle errors and send appropriate responses to the client

export default app;