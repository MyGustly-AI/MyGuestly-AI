import pkg from "bullmq";

const B = pkg.default || pkg;
const Queue = B.Queue;
let QueueScheduler =
  B.QueueScheduler || (B.default && B.default.QueueScheduler);
import env from "../config/env.js";

const connection = {
  connection: { url: env.REDIS_URL || "redis://127.0.0.1:6379" },
};

// Ensure scheduler is running for delayed jobs / retries — be tolerant to different export shapes
let scheduler = null;
try {
  if (QueueScheduler) {
    scheduler = new QueueScheduler("email", connection);
  } else {
    console.warn(
      "QueueScheduler not available from bullmq; delayed jobs/retries may be limited.",
    );
  }
} catch (err) {
  console.warn("Failed to initialize QueueScheduler:", err?.message || err);
  scheduler = null;
}

const emailQueue = new Queue("email", connection);

export { emailQueue, scheduler, connection };
