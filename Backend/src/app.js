import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import corsMiddleware from "./config/cors.js";
import routes from "./routes/index.js";
import { requestLogger } from "./infra/loggers/requestLogger.js";
import { errorLogger } from "./infra/loggers/errorLogger.js";
import { apiLimiter } from "./middlewares/rateLimitMiddleware.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { notFoundHandler } from "./middlewares/notFoundMiddleware.js";



const app = express(); // Init express ap


app.use(cookieParser()); // Middleware to parse refresh token from cookies for authentication
app.use(helmet()); // Middleware to set security-related HTTP headers for protection against common vulnerabilities
app.use(corsMiddleware); // Middleware to enable CORS for frontend-backend communication in development and production environments

app.use(compression({ threshold: 1024, level: 6 })); // Compress responses > 1KB

app.use(express.json({ limit: "100kb" })); // Middleware to parse JSON request bodies with size limit
app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  })
);

app.use(requestLogger); // Middleware to log incoming requests for debugging and monitoring purposes
app.use(apiLimiter); // Middleware to limit the number of requests from a single IP address

// Response time header for monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    res.setHeader("X-Response-Time", `${duration}ms`);
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.originalUrl} → ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get("/api/v1/health", async (req, res) => {
  const start = Date.now();
  const [dbPing, redisPing] = await Promise.allSettled([
    import("./config/prisma.js").then(({ default: p }) => p.$queryRaw`SELECT 1`),
    import("./config/redis.js").then(({ redis: r }) => r.ping()),
  ]);
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    db: dbPing.status === "fulfilled" ? "ok" : "error",
    redis: redisPing.status === "fulfilled" ? "ok" : "error",
    responseTime: `${Date.now() - start}ms`,
  });
});

app.use("/api/v1", routes); // Main API routes
app.use(notFoundHandler); // Middleware to handle 404 Not Found errors for undefined routes
app.use(errorHandler); // Middleware to handle errors and send appropriate responses to the client

export default app;
