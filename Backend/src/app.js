import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "MyGuestly AI Backend is live with ESM!",
  });
});

export default app;