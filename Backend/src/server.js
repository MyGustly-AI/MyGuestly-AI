import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

// Graceful shutdown on SIGINT signal
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
