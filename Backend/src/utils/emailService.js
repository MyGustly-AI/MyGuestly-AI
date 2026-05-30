import nodemailer from "nodemailer";
import env from "../config/env.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT || 587,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_SERVICE_USER,
        pass: env.EMAIL_SERVICE_PASS,
      },
    });
  }

  async sendMail({ to, subject, text, html, from }) {
    const mailOptions = {
      from: from || env.EMAIL_SERVICE_USER,
      to,
      subject,
      text,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendInvitation({ guest, event, invitationLink }) {
    if (!guest?.email) return null;

    const subject = `Invitation: ${event.title}`;
    const html = `
      <p>Hi ${guest.name || "Guest"},</p>
      <p>You are invited to <strong>${event.title}</strong>.</p>
      <p><strong>When:</strong> ${new Date(event.startDate).toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.location || event.venue || "TBA"}</p>
      <p>Please RSVP using the link below:</p>
      <p><a href="${invitationLink}">Confirm your attendance</a></p>
      <p>Or use this code: <code>${event.eventCode}</code></p>
      <p>Thanks,<br/>MyGuestly Team</p>
    `;

    return this.sendMail({ to: guest.email, subject, html });
  }
}

export default new EmailService();
