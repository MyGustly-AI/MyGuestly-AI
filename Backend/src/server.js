import app from "./app.js";
import env from "./config/env.js";
import { initSocketIO } from "./infra/socketio/index.js";
import { startEmailWorker } from "./infra/queues/workers/emailWorker.js";
import { startInvitationWorker } from "./infra/queues/workers/invitationWorker.js";
import { startMediaWorker } from "./infra/queues/workers/mediaWorker.js";
import { startAiWorker } from "./infra/queues/workers/aiWorker.js";
import { startNotificationWorker } from "./infra/queues/workers/notificationWorker.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

initSocketIO(server);

const workers = [];
for (const start of [startEmailWorker, startInvitationWorker, startMediaWorker, startAiWorker, startNotificationWorker]) {
  try {
    workers.push(start());
  } catch (err) {
    console.error("Failed to start worker:", err?.message || err);
  }
}

process.on("SIGINT", () => {
  console.log("Graceful shutdown");
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Graceful shutdown");
  server.close(() => {
    process.exit(0);
  });
});
