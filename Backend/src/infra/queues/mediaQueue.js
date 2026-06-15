import { Queue } from "bullmq";
import env from "../../config/env.js";
import { logger } from "../loggers/logger.js";

export const connection = {
    url: env.REDIS_URL,
};

export const mediaQueue = new Queue("media", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});

mediaQueue.on("failed", (job, err) => {
    logger.error("Media queue job failed", {
        jobId: job?.id,
        error: err?.message || err,
    });
});
