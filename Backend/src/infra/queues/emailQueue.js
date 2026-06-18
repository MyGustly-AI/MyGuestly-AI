import { Queue } from "bullmq";
import env from "../../config/env.js";
import { logger } from "../loggers/logger.js";

export const connection = {
    url: env.REDIS_URL,
};

export const emailQueue = new Queue("email", {
    connection,
    defaultJobOptions: {
        attempts: 5,

        backoff: {
            type: "exponential",
            delay: 5000,
        },

        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});

emailQueue.on("retrying", (job) => {
    logger.warn("Queue job retrying", {
        jobId: job.id,
        jobName: job.name,
        attemptsMade: job.attemptsMade,
    });
});

emailQueue.on("failed", (job, err) => {
    logger.error("Queue job failed", {
        jobId: job?.id,
        jobName: job?.name,
        attemptsMade: job?.attemptsMade,
        error: err?.message || err,
    });
});
