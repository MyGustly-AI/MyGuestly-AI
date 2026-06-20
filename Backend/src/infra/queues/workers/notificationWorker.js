import { Worker } from "bullmq";
import { connection } from "../emailQueue.js";
import prisma from "../../../shared/utils/prisma.js";
import { logger } from "../../loggers/logger.js";

export function startNotificationWorker() {
  const worker = new Worker(
    "notification",
    async (job) => {
      const { userId, type, title, body, eventId, metadata } = job.data;

      await prisma.notification.create({
        data: { userId, type, title, body, eventId, metadata },
      });

      logger.info("Notification created", { userId, type, title });
    },
    { connection, concurrency: 5 },
  );

  worker.on("completed", (job) => {
    logger.info("Notification job completed", { jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("Notification job failed", { jobId: job?.id, error: err?.message });
  });

  logger.info("Notification worker started");
  return worker;
}
