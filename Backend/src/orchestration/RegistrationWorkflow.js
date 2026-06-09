import { EmailJobs } from "../infra/queues/jobs/emailJobs.js";
import { generateEmailVerificationToken } from "../shared/utils/tokenUtils.js";

// User registration workflow
export const RegistrationWorkflow = {
    // new user
    async handleUserRegistered(user) {
        const verificationToken = generateEmailVerificationToken(user);

        await EmailJobs.sendVerification({
            to: user.email,
            fullName: user.fullName,
            token: verificationToken,
        });
    },

    // existing user
    async handleUserRestored(user) {
        const verificationToken = generateEmailVerificationToken(user);

        await EmailJobs.sendVerification({
            to: user.email,
            fullName: user.fullName,
            token: verificationToken,
        });
    }
};