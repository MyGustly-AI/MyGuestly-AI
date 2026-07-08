import { Resend } from "resend";
import env from "../../config/env.js";

class EmailService {
  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendMail({ to, subject, html, attachments }) {
    try {
      const result = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments,
      });

      console.log("Email sent:", result);
      return result;
    } catch (error) {
      console.error("Resend error:", error);
      throw error;
    }
  }

  async sendInvitation({ guest, event, invitationLink }) {
    if (!guest?.email) return null;

    const subject = `Invitation: ${event.title}`;

    const html = `
      <p>Hi ${guest.fullName || "Guest"},</p>
      <p>You are invited to <strong>${event.title}</strong>.</p>

      <p><strong>When:</strong> ${new Date(event.startDate).toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.location || "TBA"}</p>

      <p>
        <a href="${invitationLink}">
          Confirm your attendance
        </a>
      </p>

      <p>Event Code: <b>${event.eventCode}</b></p>

      <p>See you there 🚀</p>
    `;

    return this.sendMail({
      to: guest.email,
      subject,
      html,
    });
  }
}

export default new EmailService();
