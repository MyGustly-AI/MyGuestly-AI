import { google } from "googleapis";
import { logger } from "../loggers/logger.js";
import env from "../../config/env.js";

// Build an OAuth2 client using your Google Cloud project credentials
const oAuth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

/**
 * Encode a plain string to base64url format (required by Gmail API)
 */
function toBase64url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Build a raw RFC 2822 MIME message with optional attachments
 */
function buildRawMessage({ from, to, subject, html, text, attachments = [] }) {
  const boundary = `----=_Part_${Date.now()}`;
  const toAddress = Array.isArray(to) ? to.join(", ") : to;

  const lines = [
    `From: ${from}`,
    `To: ${toAddress}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
  ];

  if (attachments.length === 0) {
    // Simple HTML email, no attachments
    lines.push(`Content-Type: text/html; charset=UTF-8`, "", html || text || "");
  } else {
    // Multipart email with attachments
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`, "");
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/html; charset=UTF-8`, "", html || text || "");

    for (const att of attachments) {
      const content = Buffer.isBuffer(att.content)
        ? att.content.toString("base64")
        : Buffer.from(att.content).toString("base64");

      lines.push(`--${boundary}`);
      lines.push(
        `Content-Type: ${att.contentType || "application/octet-stream"}; name="${att.filename}"`,
        `Content-Transfer-Encoding: base64`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        "",
        content
      );
    }

    lines.push(`--${boundary}--`);
  }

  return toBase64url(lines.join("\r\n"));
}

class EmailService {
  /**
   * Send an email via the Gmail REST API (HTTPS — works on all platforms)
   * @param {Object} payload
   * @param {string}  payload.to
   * @param {string}  payload.subject
   * @param {string}  [payload.html]
   * @param {string}  [payload.text]
   * @param {string}  [payload.from]
   * @param {Array}   [payload.attachments]
   */
  async sendMail(payload) {
    const from =
      payload.from ||
      env.EMAIL_FROM ||
      `MyGuestly <${env.GMAIL_USER}>`;

    const raw = buildRawMessage({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments: payload.attachments || [],
    });

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    logger.info("Email sent via Gmail API", {
      messageId: response.data.id,
      recipient: payload.to,
    });

    return response.data;
  }
}

export default new EmailService();