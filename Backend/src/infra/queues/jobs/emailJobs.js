import { emailQueue } from "../emailQueue.js";
import { logger } from "../../loggers/logger.js";

export const EmailJobs = {
    sendInvitation(data) {
        logger.info("Invitation email job queued", {
            invitationId: data?.invitationId,
            eventId: data?.event?.id || data?.eventId,
            guestEmail: data?.guest?.email,
            jobName: "send_invitation",
        });
        return emailQueue.add("send_invitation", data);
    },

    sendVerification(data) {
        return emailQueue.add("send_verification", data);
    },

    sendPasswordReset(data) {
        return emailQueue.add("send_password_reset", data);
    },

    sendAccountDeleted(data) {
        return emailQueue.add("send_account_deleted", data);
    },
};

