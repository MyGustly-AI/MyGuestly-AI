import nodemailer from "nodemailer";
import { logger } from "../loggers/logger.js";
import env from "../../config/env.js";
import dns from "dns";

// Fix Node 17+ ENETUNREACH IPv6 issue for SMTP
dns.setDefaultResultOrder("ipv4first");

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.EMAIL_HOST,
            port: Number(env.EMAIL_PORT),
            secure: Number(env.EMAIL_PORT) === 465,
            auth: {
                user: env.EMAIL_SERVICE_USER,
                pass: env.EMAIL_SERVICE_PASS,
            },
        });
    }

    async sendMail(payload) {
        const info = await this.transporter.sendMail({
            from: payload.from || `"MyGuestly" <${env.EMAIL_SERVICE_USER}>`,
            to: payload.to,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
            attachments: payload.attachments,
        });

        logger.info("Email sent", {
            messageId: info.messageId,
            recipient: payload.to,
        });

        return info;
    }
}

export default new EmailService();