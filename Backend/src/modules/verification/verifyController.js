import { BaseController } from "../../shared/base/BaseController.js";
import { prisma } from "../../shared/utils/prisma.js";
import { QRUtil } from "../../shared/utils/helpers.js";
import { AppError } from "../../shared/utils/AppError.js";
import { logger } from "../../infra/loggers/logger.js";

class VerifyController extends BaseController {
  constructor() {
    super();
  }

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

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      logger.warn("QR check-in rejected", { reason: "invitation_not_found", token, ip });
      return this.notFound(res, "Invitation not found");
    }

    const ok = QRUtil.verifyTOTP(invitation.token, String(totp));
    if (!ok) {
      logger.warn("QR check-in rejected", { reason: "invalid_totp", guestId: invitation.guestId, eventId: invitation.eventId, ip });
      return this.badRequest(res, "Invalid or expired code");
    }

    try {
      const guestId = invitation.guestId;

      const existingCheckIn = await prisma.checkIn.findUnique({
        where: { guestId },
      });

      if (existingCheckIn) {
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
          logger.error("Failed to create duplicate-scan notification:", err?.message || err);
        }

        logger.warn("QR check-in rejected", {
          reason: "already_checked_in",
          guestId,
          eventId: invitation.eventId,
          ip,
        });

        return this.badRequest(res, "This code has already been used (possible fraud)");
      }

      await prisma.checkIn.create({
        data: {
          guestId,
          eventId: invitation.eventId,
          checkedByIp: ip,
        },
      });

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "CHECKED_IN" },
      });

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
