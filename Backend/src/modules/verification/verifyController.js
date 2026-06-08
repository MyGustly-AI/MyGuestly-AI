import { BaseController } from "./BaseController.js";
import { prisma } from "../utils/prisma.js";
import { QRUtil } from "../utils/helpers.js";
import { AppError } from "../utils/AppError.js";

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

    if (!token) return this.badRequest(res, "Missing token");
    if (!totp) return this.badRequest(res, "Missing totp code");

    // Find invitation
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) return this.notFound(res, "Invitation not found");

    // Verify TOTP using invitation.token as secret
    const ok = QRUtil.verifyTOTP(invitation.token, String(totp));
    if (!ok) return this.badRequest(res, "Invalid or expired code");

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

      return this.success(res, "Check-in successful", {
        guestId,
        eventId: invitation.eventId,
      });
    } catch (error) {
      throw AppError.internalError("Check-in failed");
    }
  });
}

export default new VerifyController();
