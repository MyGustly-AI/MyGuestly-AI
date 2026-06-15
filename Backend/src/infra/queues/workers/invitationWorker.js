import { Worker } from "bullmq";
import { connection } from "../emailQueue.js";
import prisma from "../../../shared/utils/prisma.js";
import EmailService from "../../email/emailService.js";
import { invitationTemplate } from "../../email/emailTemplates.js";
import { generateTicketPDF } from "../../email/ticketGenerator.js";
import { TermiiService } from "../../sms/termiiService.js";
import { logger } from "../../loggers/logger.js";

const termii = new TermiiService(
  process.env.TERMII_API_KEY,
  process.env.TERMII_SENDER_ID,
);

export function startInvitationWorker() {
  const worker = new Worker(
    "invitation",
    async (job) => {
      switch (job.name) {
        case "send_batch":
          return handleSendBatch(job.data);
        case "resend":
          return handleResend(job.data);
        default:
          throw new Error(`Unknown job: ${job.name}`);
      }
    },
    { connection, concurrency: 5 },
  );

  worker.on("completed", (job) => {
    logger.info("Invitation job completed", { jobId: job.id, jobName: job.name });
  });

  worker.on("failed", (job, err) => {
    logger.error("Invitation job failed", { jobId: job?.id, error: err?.message });
  });

  logger.info("Invitation worker started");
  return worker;
}

async function handleSendBatch(data) {
  const { eventId, guests, event } = data;
  const results = { sent: 0, failed: 0 };

  for (const guest of guests) {
    const invitationLink = `${process.env.APP_CLIENT_URL || "http://localhost:3000"}/rsvp/${event?.eventCode || eventId}`;

    if (guest.email) {
      try {
        const template = invitationTemplate({ guest, event, invitationLink });
        await EmailService.sendMail({
          to: guest.email,
          subject: template.subject,
          html: template.html,
        });
        results.sent++;
      } catch (err) {
        results.failed++;
        logger.error("Failed to send invitation email", {
          guestId: guest.id, error: err.message,
        });
      }
    }

    if (guest.phone) {
      try {
        const message = `You're invited to ${event?.title || "an event"}! RSVP: ${invitationLink}`;
        await termii.sendSMS(guest.phone, message);
      } catch (err) {
        logger.error("Failed to send invitation SMS", {
          guestId: guest.id, error: err.message,
        });
      }
    }
  }

  await prisma.invitation.updateMany({
    where: { eventId, guestId: { in: guests.map((g) => g.id) } },
    data: { sentAt: new Date() },
  });

  return results;
}

async function handleResend(data) {
  const { invitationId } = data;
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { guest: true, event: true },
  });
  if (!invitation || !invitation.guest) return;

  const invitationLink = `${process.env.APP_CLIENT_URL || "http://localhost:3000"}/rsvp/${invitation.event.eventCode}/${invitation.token}`;

  const template = invitationTemplate({
    guest: invitation.guest,
    event: invitation.event,
    invitationLink,
  });

  await EmailService.sendMail({
    to: invitation.guest.email,
    subject: template.subject,
    html: template.html,
  });

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { sentAt: new Date(), sentBy: "resend" },
  });
}
