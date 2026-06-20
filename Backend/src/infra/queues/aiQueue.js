import { Queue } from "bullmq";
import { connection } from "./emailQueue.js";
import { logger } from "../loggers/logger.js";

export const aiTagQueue = new Queue("ai.tag", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

aiTagQueue.on("retrying", (job) => {
  logger.warn("AI tag queue job retrying", { jobId: job.id, attemptsMade: job.attemptsMade });
});

aiTagQueue.on("failed", (job, err) => {
  logger.error("AI tag queue job failed", { jobId: job?.id, error: err?.message });
});
