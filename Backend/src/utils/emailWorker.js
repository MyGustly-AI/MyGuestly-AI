import { Worker } from 'bullmq';
import { emailQueue, connection } from './emailQueue.js';
import EmailService from './emailService.js';
import resendService from './resendService.js';
import { prisma } from './prisma.js';
import env from '../config/env.js';

// Worker to process email jobs
const worker = new Worker(
  'email',
  async (job) => {
    const data = job.data || {};
    const {
      guest,
      event,
      invitationLink,
      qrImageBase64,
      invitationId,
      hostId,
    } = data;

    // Try Resend first if configured, fallback to EmailService
    try {
      if (env.RESEND_API_KEY) {
        const result = await resendService.sendInvitation({
          guest,
          event,
          invitationLink,
          qrBase64: qrImageBase64,
        });
        if (invitationId) {
          await prisma.invitation.update({ where: { id: invitationId }, data: { sentAt: new Date(), sentBy: hostId } });
        }
        return result;
      }
    } catch (err) {
      console.warn('Resend send failed, falling back to EmailService:', err?.message || err);
    }

    // Fallback to nodemailer-based EmailService
    try {
      const mailResult = await EmailService.sendInvitation({ guest, event, invitationLink, qrImageBase64 });
      if (invitationId) {
        await prisma.invitation.update({ where: { id: invitationId }, data: { sentAt: new Date(), sentBy: hostId } });
      }
      return mailResult;
    } catch (err) {
      // bubble error so Bull can retry according to attempts/backoff
      throw err;
    }
  },
  { connection, concurrency: 5 },
);

worker.on('completed', (job) => {
  console.info(`Email job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err?.message || err);
});

export default worker;
