import { Queue } from "bullmq";
import { connection } from "./emailQueue.js";
import { logger } from "../loggers/logger.js";

export const invitationQueue = new Queue("invitation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

invitationQueue.on("retrying", (job) => {
  logger.warn("Invitation queue job retrying", {
    jobId: job.id, attemptsMade: job.attemptsMade,
  });
});

invitationQueue.on("failed", (job, err) => {
  logger.error("Invitation queue job failed", {
    jobId: job?.id, error: err?.message,
  });
});
