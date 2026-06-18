import { logger } from "../loggers/logger.js";

const TERMII_BASE = "https://api.termii.com/v1";

export class TermiiService {
  constructor(apiKey, senderId) {
    this.apiKey = apiKey;
    this.senderId = senderId;
  }

  async sendSMS(to, message) {
    if (!this.apiKey) {
      logger.warn("Termii API key not configured, skipping SMS", { to });
      return null;
    }

    const payload = {
      api_key: this.apiKey,
      to,
      from: this.senderId || "MyGuestly",
      sms: message,
      type: "plain",
      channel: "generic",
    };

    try {
      const res = await fetch(`${TERMII_BASE}/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      logger.info("Termii SMS sent", { to, messageId: data?.message_id });
      return data;
    } catch (err) {
      logger.error("Termii SMS failed", { to, error: err.message });
      throw err;
    }
  }

  async sendBulk(recipients, message) {
    if (!this.apiKey) {
      logger.warn("Termii API key not configured, skipping bulk SMS");
      return null;
    }

    const payload = {
      api_key: this.apiKey,
      to: recipients,
      from: this.senderId || "MyGuestly",
      sms: message,
      type: "plain",
      channel: "generic",
    };

    try {
      const res = await fetch(`${TERMII_BASE}/sms/send/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      logger.info("Termii bulk SMS sent", { count: recipients.length });
      return data;
    } catch (err) {
      logger.error("Termii bulk SMS failed", { error: err.message });
      throw err;
    }
  }
}

export default TermiiService;
