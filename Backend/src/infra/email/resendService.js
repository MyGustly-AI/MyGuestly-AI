import env from "../config/env.js";

const RESEND_API = "https://api.resend.com/emails";

async function sendRawEmail(payload) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`Resend API error: ${res.status} ${txt}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function sendInvitation({
  guest,
  event,
  invitationLink,
  qrBase64,
}) {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  // Generate a simple HTML template
  const html = `
    <div style="font-family: Arial, sans-serif; color:#222;">
      <h2 style="color:#6B5BFF">You're invited: ${event.title}</h2>
      <p>Hi ${guest.fullName || guest.name || "Guest"},</p>
      <p>When: <strong>${new Date(event.startDate).toLocaleString()}</strong></p>
      <p>Where: <strong>${event.venueName || event.location || "TBA"}</strong></p>
      <p>Open your attached ticket or <a href="${invitationLink}">RSVP here</a>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">MyGuestly Team</p>
    </div>
  `;

  // Build attachments: ticket pdf and qr png if provided
  const attachments = [];

  if (qrBase64) {
    // ticket PDF generation: simple one-page with embedded QR (base64)
    // lazy import pdfkit to keep startup light
    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    let imgBuffer = Buffer.from(qrBase64, "base64");
    const pdfBuffer = await new Promise((resolve, reject) => {
      try {
        const chunks = [];
        doc.on("data", (c) => chunks.push(c));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (e) => reject(e));

        doc.fontSize(20).text(event.title, { align: "center" });
        doc.moveDown();
        doc
          .fontSize(12)
          .text(`When: ${new Date(event.startDate).toLocaleString()}`);
        doc.text(`Where: ${event.venueName || event.location || "TBA"}`);
        doc.moveDown();
        const imageWidth = 250;
        const pageCenter = (doc.page.width - imageWidth) / 2;
        doc.image(imgBuffer, pageCenter, doc.y, { width: imageWidth });
        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    attachments.push({
      filename: "ticket.pdf",
      type: "application/pdf",
      content: pdfBuffer.toString("base64"),
    });
    attachments.push({
      filename: "qrcode.png",
      type: "image/png",
      content: imgBuffer.toString("base64"),
    });
  }

  const payload = {
    from: env.EMAIL_FROM || "no-reply@myguestly.ai",
    to: [guest.email],
    subject: `Invitation: ${event.title}`,
    html,
    // Resend expects attachments array with name, type, data (base64)
    attachments,
  };

  return sendRawEmail(payload);
}

export default { sendInvitation };
