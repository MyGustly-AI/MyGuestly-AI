import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "../loggers/logger.js";
import env from "../../config/env.js";

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

        if (env.RESEND_ENABLED === "true" && env.RESEND_API_KEY) {
            this.resend = new Resend(env.RESEND_API_KEY);
        }
    }

    async sendMail(payload) {
        try {
            const info = await this.transporter.sendMail({
                from: payload.from || `"${env.SMTP_FROM_NAME || "MyGuestly"}" <${env.EMAIL_SERVICE_USER}>`,
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
        } catch (error) {
            if (this.resend) {
                logger.warn("SMTP failed, falling back to Resend", {
                    error: error.message,
                    recipient: payload.to,
                });

                const { data, error: resendError } = await this.resend.emails.send({
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

                if (resendError) throw resendError;

                logger.info("Email sent via Resend (fallback)", {
                    emailId: data?.id,
                    recipient: payload.to,
                });

                return data;
            }

            logger.error("Failed to send email", {
                error: error.message,
                recipient: payload.to,
            });
            throw error;
        }
    }
}

export default new EmailService();