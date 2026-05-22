// backend/src/app.js
import "dotenv/config"; // Automatically loads your local .env file
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "MyGuestly AI Backend is live with ESM!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
