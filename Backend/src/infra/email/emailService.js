import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "../loggers/logger.js";
import env from "../../config/env.js";

class EmailService {
    constructor() {
        if (env.RESEND_API_KEY) {
            this.resend = new Resend(env.RESEND_API_KEY);
        } else {
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
    }

    async sendMail(payload) {
        if (this.resend) {
            const { data, error } = await this.resend.emails.send({
                from: payload.from || env.EMAIL_FROM || `MyGuestly <${env.EMAIL_SERVICE_USER}>`,
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
                attachments: payload.attachments?.map(a => ({
                    filename: a.filename,
                    content: a.content instanceof Buffer ? a.content.toString("base64") : a.content,
                })),
            });

            if (error) throw error;

            logger.info("Email sent via Resend", {
                emailId: data?.id,
                recipient: payload.to,
            });

            return data;
        }

        const info = await this.transporter.sendMail({
            from: payload.from || `"MyGuestly" <${env.EMAIL_SERVICE_USER}>`,
            to: payload.to,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
            attachments: payload.attachments,
        });

        logger.info("Email sent via SMTP", {
            messageId: info.messageId,
            recipient: payload.to,
        });

        return info;
    }
}

export default new EmailService();