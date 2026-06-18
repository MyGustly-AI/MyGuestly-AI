import { notificationQueue } from "../notificationQueue.js";
import { logger } from "../../loggers/logger.js";

export const NotificationJobs = {
  send(data) {
    logger.info("Notification job queued", {
      userId: data.userId, type: data.type,
    });
    return notificationQueue.add("send", data, {
      jobId: `notif-${data.userId}-${data.type}-${data.refId || Date.now()}`,
    });
  },
};
