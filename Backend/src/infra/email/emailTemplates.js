import env from "../../config/env.js";

// Verification email template
export function verificationTemplate({
    fullName,
    token,
}) {
    const verificationLink =
        `${env.APP_CLIENT_URL}/verify-email?token=${token}`;

    return {
        subject: "Verify your MyGuestly account",

        html: `
            <h2>Verify your email</h2>

            <p>Hello ${fullName},</p>

            <p>
                Please verify your email address.
            </p>

            <a href="${verificationLink}">
                Verify Email
            </a>
        `,
    };
}

// Password reset email template
export function passwordResetTemplate({
    fullName,
    token,
}) {
    const resetLink =
        `${env.APP_CLIENT_URL}/reset-password?token=${token}`;

    return {
        subject: "Reset your password",

        html: `
            <h2>Password Reset</h2>

            <p>Hello ${fullName},</p>

            <a href="${resetLink}">
                Reset Password
            </a>
        `,
    };
}

// Account deletion email template
export function accountDeletedTemplate({
    fullName,
}) {
    return {
        subject: "Account Deleted",

        html: `
            <h2>Account Deleted</h2>

            <p>Hello ${fullName},</p>

            <p>
                Your account has been removed.
            </p>
        `,
    };
}

// Event invitation email template
export function invitationTemplate({
    guest,
    event,
    invitationLink,
}) {
    return {
        subject: `Invitation: ${event.title}`,

        html: `
            <h2>You're Invited!</h2>

            <p>
                Hello ${
                    guest.fullName ||
                    guest.name ||
                    "Guest"
                },
            </p>

            <p>
                You have been invited to
                <strong>${event.title}</strong>.
            </p>

            <p>
                Date:
                ${new Date(
                    event.startDate
                ).toLocaleString()}
            </p>

            <p>
                Venue:
                ${
                    event.location ||
                    event.venueName ||
                    "TBA"
                }
            </p>

            <a href="${invitationLink}">
                Confirm Attendance
            </a>
        `,
    };
}