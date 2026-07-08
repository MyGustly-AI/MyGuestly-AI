import { BaseController } from "../../shared/base/BaseController.js";
import { prisma } from "../../shared/utils/prisma.js";
import { QRUtil } from "../../shared/utils/helpers.js";
import { AppError } from "../../shared/utils/AppError.js";
import { logger } from "../../infra/loggers/logger.js";

class VerifyController extends BaseController {
  constructor() {
    super();
  }

  /**
   * POST /verify-gate/:token
   * Body: { totp }
   * Verifies a time-based QR payload and marks guest checked-in atomically.
   */
  verifyGate = this.asyncHandler(async (req, res) => {
    const token = req.params.token;
    const { totp } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || null;

    if (!token) {
      logger.warn("QR check-in rejected", { reason: "missing_token", ip });
      return this.badRequest(res, "Missing token");
    }
    if (!totp) {
      logger.warn("QR check-in rejected", { reason: "missing_totp", token, ip });
      return this.badRequest(res, "Missing totp code");
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      logger.warn("QR check-in rejected", { reason: "invitation_not_found", token, ip });
      return this.notFound(res, "Invitation not found");
    }

    // Verify TOTP using invitation.token as secret
    const ok = QRUtil.verifyTOTP(invitation.token, String(totp));
    if (!ok) {
      logger.warn("QR check-in rejected", { reason: "invalid_totp", guestId: invitation.guestId, eventId: invitation.eventId, ip });
      return this.badRequest(res, "Invalid or expired code");
    }

    // Atomic check-in: only set checkedIn if currently false
    try {
      const guestId = invitation.guestId;

      // Use updateMany to perform a conditional update (atomic at DB level)
      const result = await prisma.guest.updateMany({
        where: { id: guestId, checkedIn: false },
        data: { checkedIn: true, checkInTime: new Date() },
      });

      if (result.count === 0) {
        // Guest already checked in -> fraud / double-scan
        // Optionally create a notification for the host
        try {
          const event = await prisma.event.findUnique({
            where: { id: invitation.eventId },
          });
          if (event) {
            await prisma.notification.create({
              data: {
                type: "QR_SCANNED",
                title: "Duplicate QR scan detected",
                body: `QR token ${token} was scanned multiple times for event ${event.title}`,
                userId: event.hostId,
                eventId: event.id,
              },
            });
          }
        } catch (err) {
          console.error(
            "Failed to create duplicate-scan notification:",
            err?.message || err,
          );
        }

        logger.warn("QR check-in rejected", {
          reason: "already_checked_in",
          guestId,
          eventId: invitation.eventId,
          ip,
        });

        return this.badRequest(
          res,
          "This code has already been used (possible fraud)",
        );
      }

      // Create a CheckIn record (guestId unique)
      try {
        await prisma.checkIn.create({
          data: {
            guestId,
            eventId: invitation.eventId,
            checkedByIp: ip,
          },
        });
      } catch (err) {
        // If CheckIn creation fails due to unique constraint, ignore — guest was checked in above
        console.warn("CheckIn creation warning:", err?.message || err);
      }

      logger.info("QR check-in successful", {
        guestId,
        eventId: invitation.eventId,
        ip,
      });

      return this.success(res, "Check-in successful", {
        guestId,
        eventId: invitation.eventId,
      });
    } catch (error) {
      logger.error("QR check-in failed", {
        token,
        ip,
        error: error?.message || error,
      });
      throw AppError.internalError("Check-in failed");
    }
  });
}

export default new VerifyController();
