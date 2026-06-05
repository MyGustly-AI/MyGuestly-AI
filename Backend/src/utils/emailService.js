import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import env from "../config/env.js";

class EmailService {
  constructor() {
    this.initTransport();
  }

  async initTransport() {
    // If SMTP config provided, use it. Otherwise in non-production create
    // an Ethereal test account for development so emails can be previewed.
    if (env.EMAIL_HOST && env.EMAIL_SERVICE_USER && env.EMAIL_SERVICE_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT || 587,
        secure: env.EMAIL_PORT === 465,
        auth: {
          user: env.EMAIL_SERVICE_USER,
          pass: env.EMAIL_SERVICE_PASS,
        },
      });
      this.isEthereal = false;
    } else {
      if (env.NODE_ENV === "production") {
        console.error("Email provider not configured in production");
        // keep transporter undefined to fail loudly on send
        this.transporter = null;
        this.isEthereal = false;
        return;
      }

      // Create Ethereal account for local dev/testing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.isEthereal = true;
    }
  }

  async sendMail(mailOptions = {}) {
    if (!this.transporter) {
      // If transporter not ready, try initializing (safe-guard for async init)
      await this.initTransport();
      if (!this.transporter)
        throw new Error("Email transporter not configured");
    }

    // Ensure from is set and preserve any passed attachments or headers
    const finalOptions = {
      from: mailOptions.from || env.EMAIL_SERVICE_USER || "no-reply@myguestly.local",
      ...mailOptions,
    };

    const info = await this.transporter.sendMail(finalOptions);

    // If using Ethereal in dev, attach preview URL to the returned info
    if (this.isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        // eslint-disable-next-line no-console
        console.info("Ethereal preview URL:", previewUrl);
        try {
          // attach for callers to inspect
          info.previewUrl = previewUrl;
        } catch (e) {
          // ignore
        }
      }
    }

    return info;
  }

  async sendInvitation({ guest, event, invitationLink }) {
    if (!guest?.email) return null;

    const subject = `Invitation: ${event.title}`;
    const html = `
        <p>Hi ${guest.fullName || guest.name || "Guest"},</p>
        <p>You are invited to <strong>${event.title}</strong>.</p>
        <p><strong>When:</strong> ${new Date(event.startDate).toLocaleString()}</p>
        <p><strong>Where:</strong> ${event.location || event.venueName || "TBA"}</p>
        <p>Please RSVP using the link below or open the attached ticket PDF:</p>
        <p><a href="${invitationLink}">Confirm your attendance</a></p>
        <p>Or use this code: <code>${event.eventCode}</code></p>
        <p>Thanks,<br/>MyGuestly Team</p>
      `;

    const mailOptions = {
      to: guest.email,
      subject,
      html,
      from: env.EMAIL_SERVICE_USER || "no-reply@myguestly.local",
    };

    // If qrImageBase64 provided, embed it into a PDF ticket and attach
    const qrBase64 = arguments[0]?.qrImageBase64;
    if (qrBase64) {
      const pdfBuffer = await new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ size: "A4", margin: 50 });
          const chunks = [];
          doc.on("data", (c) => chunks.push(c));
          doc.on("end", () => resolve(Buffer.concat(chunks)));

          doc.fontSize(20).text(event.title, { align: "center" });
          doc.moveDown();
          doc
            .fontSize(12)
            .text(`When: ${new Date(event.startDate).toLocaleString()}`);
          doc.text(`Where: ${event.location || event.venueName || "TBA"}`);
          doc.text(`Code: ${event.eventCode}`);
          doc.moveDown();

          const imgBuffer = Buffer.from(qrBase64, "base64");
          const imageWidth = 250;
          const pageCenter = (doc.page.width - imageWidth) / 2;
          doc.image(imgBuffer, pageCenter, doc.y, { width: imageWidth });

          doc.moveDown(2);
          doc
            .fontSize(10)
            .text(
              "Present this ticket at the gate. The dynamic QR displayed in the guest app refreshes every 30s.",
              { align: "center" },
            );

          doc.end();
        } catch (err) {
          reject(err);
        }
      });

      // Also include the QR image as a fallback attachment (some mail clients strip PDFs)
      const imgBuffer = Buffer.from(qrBase64, "base64");
      mailOptions.attachments = [
        {
          filename: "ticket.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
        {
          filename: "qrcode.png",
          content: imgBuffer,
          contentType: "image/png",
        },
      ];
    }

    return this.sendMail(mailOptions);
  }
}

export default new EmailService();
