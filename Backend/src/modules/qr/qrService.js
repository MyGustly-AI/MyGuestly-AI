import { AppError } from "../../shared/utils/AppError.js";
import { QrUtils } from "../../shared/utils/qrUtils.js";
import { redis } from "../../config/redis.js";
import { logger } from "../../infra/loggers/logger.js";
import { emitToEvent } from "../../infra/socketio/index.js";
import { checkinsTotal } from "../../infra/metrics/index.js";

export class QRService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async scan(token, scannedEventId, scannedByUserId) {
    const payload = QrUtils.verifyQRToken(token);
    if (!payload) {
      logger.warn("QR scan rejected: invalid token");
      throw AppError.unauthorized("Invalid or expired QR code");
    }

    const { invitationId, eventId } = payload;

    const usedKey = `qr:used:${invitationId}`;
    const acquired = await redis.set(usedKey, "1", "NX", "EX", 86400);
    if (!acquired) {
      logger.warn("QR scan rejected: already used", { invitationId });
      throw AppError.conflict("QR code has already been used");
    }

    if (eventId !== scannedEventId) {
      await redis.del(usedKey);
      logger.warn("QR scan rejected: event mismatch", { invitationId, eventId, scannedEventId });
      throw AppError.forbidden("QR code does not match this event");
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { guest: true },
    });

    if (!invitation) {
      await redis.del(usedKey);
      throw AppError.notFound("Invitation not found");
    }

    if (!invitation.guest) {
      await redis.del(usedKey);
      throw AppError.notFound("Guest not found");
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        guestId: invitation.guestId,
        eventId: scannedEventId,
        checkedByIp: null,
      },
    });

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "CHECKED_IN" },
    });

    logger.info("Check-in successful", {
      invitationId,
      guestId: invitation.guestId,
      eventId: scannedEventId,
    });

    checkinsTotal.inc();

    emitToEvent(scannedEventId, "checkin:new", {
      guestId: invitation.guestId,
      guestName: invitation.guest.fullName,
      checkedAt: checkIn.createdAt,
      totalCheckedIn: await this.prisma.checkIn.count({ where: { eventId: scannedEventId } }),
    });

    return {
      checkIn,
      guest: {
        id: invitation.guest.id,
        fullName: invitation.guest.fullName,
      },
    };
  }

  async listCheckins(eventId, skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where: { eventId },
        skip,
        take,
        orderBy: { checkedAt: "desc" },
        include: { guest: { select: { id: true, fullName: true } } },
      }),
      this.prisma.checkIn.count({ where: { eventId } }),
    ]);
    return { data, total };
  }

  async liveCount(eventId) {
    const cached = await redis.get(`event:${eventId}:stats`);
    if (cached) return JSON.parse(cached);

    const count = await this.prisma.checkIn.count({ where: { eventId } });
    const result = { checkedIn: count };

    await redis.set(`event:${eventId}:stats`, JSON.stringify(result), "EX", 30);

    return result;
  }
}
