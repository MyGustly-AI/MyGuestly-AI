import app from "./app.js";
import env from "./config/env.js";
import startEmailWorker from "./utils/emailWorker.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

// Start background workers (email queue)
try {
  startEmailWorker();
  console.log("Email worker started");
} catch (err) {
  console.error("Failed to start email worker:", err?.message || err);
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Graceful shutdown");

  server.close(() => {
    process.exit(0);
  });
});

// Graceful shutdown on SIGTERM signal
process.on("SIGTERM", () => {
  console.log("Graceful shutdown");

  server.close(() => {
    process.exit(0);
  });
});
