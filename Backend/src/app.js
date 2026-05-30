import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  authMiddleware,
  authorize,
  optionalAuth,
  errorHandler,
  notFoundHandler,
  requestLogger,
  corsConfig,
  createRateLimiter,
} from "./middlewares/authMiddleware.js";
import routes from "./routes/index.js";

const app = express();

// ===== MIDDLEWARE STACK =====

// CORS and body parsing
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request logging
app.use(requestLogger);

// rate limiting
app.use(createRateLimiter());

// ===== ROUTES =====

// Health check endpoint (no auth required)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MyGuestly AI Backend is live!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1", routes);

// ===== ERROR HANDLING MIDDLEWARE =====

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// global error handler (must be last)
app.use(errorHandler);

//startserver 

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`\n Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health\n`);
});

export default app;
