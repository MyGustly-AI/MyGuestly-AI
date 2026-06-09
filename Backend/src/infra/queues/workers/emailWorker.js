import { Worker } from "bullmq";
import { connection } from "../emailQueue.js";
import EmailService from "../../email/emailService.js";
import {
  verificationTemplate,
  passwordResetTemplate,
  accountDeletedTemplate,
  invitationTemplate,
} from "../../email/emailTemplates.js";
import { generateTicketPDF } from "../../email/ticketGenerator.js";
import { logger } from "../../logs/logger.js";

export function startEmailWorker() {
  const worker = new Worker(
    "email",
    async (job) => {
      switch (job.name) {
        case "send_verification":
          return handleVerification(job.data);

        case "send_password_reset":
          return handlePasswordReset(job.data);

        case "send_account_deleted":
          return handleAccountDeleted(job.data);

        case "send_invitation":
          return handleInvitation(job.data);

        default:
          throw new Error(`Unknown email job: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 10,
    }
  );

  worker.on("completed", (job) => {
    logger.info("Email job completed", {
      jobId: job.id,
      jobName: job.name,
    });
    console.log(`Email sent successfully | Job: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    logger.error("Email job failed", {
      jobId: job?.id,
      jobName: job?.name,
      error: err?.message || err,
    });
    console.error(`Email failed | Job: ${job?.id}`, err.message);
  });

  worker.on("error", (err) => {
    logger.error("Email worker error", {
      error: err?.message || err,
    });
    console.error("Email Worker Error:", err);
  });

  logger.info("Email worker started", { queueName: "email" });
  console.log("Email Worker started");

  return worker;
}

// Verification email handler
async function handleVerification(data) {
    const template = verificationTemplate(data);

    const result = await EmailService.sendMail({
        to: data.to,
        subject: template.subject,
        html: template.html,
    });

    logger.info("Verification email sent", {
        to: data.to,
    });

    return result;
}

// Password reset email handler
async function handlePasswordReset(data) {
    const template = passwordResetTemplate(data);

    const result = await EmailService.sendMail({
        to: data.to,
        subject: template.subject,
        html: template.html,
    });

    logger.info("Password reset email sent", {
        to: data.to,
    });

    return result;
}

// Account deletion email handler
async function handleAccountDeleted(data) {
    const template = accountDeletedTemplate(data);

    const result = await EmailService.sendMail({
        to: data.to,
        subject: template.subject,
        html: template.html,
    });

    logger.info("Account deletion email sent", {
        to: data.to,
    });

    return result;
}

// Event invitation email handler
async function handleInvitation(data) {
    const {guest, event, invitationLink, qrImageBase64,} = data;

    const template = invitationTemplate({
            guest,
            event,
            invitationLink,
        });

    let attachments = [];

    if (qrImageBase64) {
        const pdf =
            await generateTicketPDF({
                guest,
                event,
                qrImageBase64,
            });

        attachments.push({
            filename: "ticket.pdf",
            content: pdf,
            contentType:
                "application/pdf",
        });

        attachments.push({
            filename: "qrcode.png",
            content: Buffer.from(
                qrImageBase64,
                "base64"
            ),
            contentType: "image/png",
        });
    }

    const result = await EmailService.sendMail({
        to: guest.email,
        subject: template.subject,
        html: template.html,
        attachments,
    });

    logger.info("Invitation sent", {
        invitationId: data.invitationId,
        eventId: event?.id,
        guestEmail: guest.email,
    });

    return result;
}

