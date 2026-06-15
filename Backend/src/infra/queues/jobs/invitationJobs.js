import { invitationQueue } from "../invitationQueue.js";
import { logger } from "../../loggers/logger.js";

export const InvitationJobs = {
  sendBatch(data) {
    logger.info("Invitation batch job queued", {
      eventId: data.eventId, count: data.guests?.length,
    });
    return invitationQueue.add("send_batch", data, {
      jobId: `invite:${data.eventId}:${Date.now()}`,
    });
  },

  resend(data) {
    return invitationQueue.add("resend", data, {
      jobId: `invite:resend:${data.invitationId}`,
    });
  },
};
