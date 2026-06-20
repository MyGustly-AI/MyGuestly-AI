import { Queue } from "bullmq";
import { connection } from "./emailQueue.js";
import { logger } from "../loggers/logger.js";

export const notificationQueue = new Queue("notification", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

notificationQueue.on("retrying", (job) => {
  logger.warn("Notification queue job retrying", { jobId: job.id, attemptsMade: job.attemptsMade });
});

notificationQueue.on("failed", (job, err) => {
  logger.error("Notification queue job failed", { jobId: job?.id, error: err?.message });
});
