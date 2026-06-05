import "dotenv/config";
import express from "express";

import corsMiddleware from "./config/cors.js";
import routes from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { createRateLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(createRateLimiter());

// Health check
app.get("/api/v1/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "MyGuestly AI Backend is live" });
});

// API routes
app.use("/api/v1", routes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
