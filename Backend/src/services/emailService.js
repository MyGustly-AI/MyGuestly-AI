import nodemailer from "nodemailer";
import { env } from "../config/env.js";

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
            from: from || `"Myguestly" <${env.EMAIL_SERVICE_USER}>`,
            to,
            subject,
            text,
            html,
        };
        return this.transporter.sendMail(mailOptions);
    }

    // Send event invitation email to guest with RSVP link and event details
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

    // Send email verification link to new users with tokenized URL
    async sendVerificationEmail({ to, fullName, token }) {
        const verificationLink = `${env.APP_CLIENT_URL}/verify-email?token=${token}`;
        const subject = "Verify your Myguestly account";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify your email address</h2>
                <p>Hi ${fullName},</p>
                <p>Thanks for signing up for Myguestly. Please verify your email address by clicking the button below.</p>
                <p>This link expires in <strong>24 hours</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}"
                        style="background-color: #4F46E5; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${verificationLink}</p>
                <p>If you did not create an account, you can safely ignore this email.</p>
                <p>Thanks,<br/>Myguestly Team</p>
            </div>
        `;
        return this.sendMail({ to, subject, html });
    }

    // Send password reset email with tokenized URL to allow users to set new password
    async sendPasswordResetEmail({ to, fullName, token }) {
        const resetLink = `${env.APP_CLIENT_URL}/reset-password?token=${token}`;
        const subject = "Reset your Myguestly password";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Reset your password</h2>
                <p>Hi ${fullName},</p>
                <p>We received a request to reset your Myguestly password. Click the button below to choose a new password.</p>
                <p>This link expires in <strong>1 hour</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}"
                        style="background-color: #4F46E5; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${resetLink}</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                <p>Thanks,<br/>Myguestly Team</p>
            </div>
        `;
        return this.sendMail({ to, subject, html });
    }

    // Send account deletion confirmation email to users who have deleted their account, confirming data removal and providing contact info if deletion was not requested
    async sendAccountDeletedEmail({ to, fullName }) {
        const subject = "Your Myguestly account has been deleted";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Account deleted</h2>
                <p>Hi ${fullName},</p>
                <p>Your Myguestly account has been successfully deleted. All your data has been removed from our platform.</p>
                <p>If you ever change your mind, you can always create a new account at
                    <a href="${env.APP_CLIENT_URL}">${env.APP_CLIENT_URL}</a>.
                </p>
                <p>If you did not request this deletion, please contact us immediately at
                    <a href="mailto:${env.EMAIL_SERVICE_USER}">${env.EMAIL_SERVICE_USER}</a>.
                </p>
                <p>Thanks,<br/>Myguestly Team</p>
            </div>
        `;
        return this.sendMail({ to, subject, html });
    }
}

export default new EmailService();