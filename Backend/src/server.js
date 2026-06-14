import app from "./app.js";
import env from "./config/env.js";
import {startEmailWorker} from "./infra/queues/workers/emailWorker.js";
import {startMediaWorker} from "./infra/queues/workers/mediaWorker.js";
import { initSocket } from "./infra/socket.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

// Initialize socket.io
try {
  initSocket(server);
  console.log("Socket.io initialized");
} catch (err) {
  console.error("Failed to initialize Socket.io:", err?.message || err);
}

// Start background workers (email queue)
try {
  startEmailWorker();
  startMediaWorker();
} catch (err) {
  console.error("Failed to start workers:", err?.message || err);
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
