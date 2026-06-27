import { AppError } from "../../shared/utils/AppError.js";
import { QrUtils } from "../../shared/utils/qrUtils.js";
import { logger } from "../../infra/loggers/logger.js";
import { emailQueue } from "../../infra/queues/emailQueue.js";
import QRCode from "qrcode";
import env from "../../config/env.js";

const BASE_URL = env.APP_CLIENT_URL || env.APP_API_URL;

export class InvitationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getInvitation(invitationId) {
    let invitation = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(invitationId)) {
      invitation = await this.prisma.invitation.findUnique({
        where: { id: invitationId },
        include: { guest: true, event: { include: { host: true } } },
      });

      if (!invitation) {
        invitation = await this.prisma.invitation.findUnique({
          where: { token: invitationId },
          include: { guest: true, event: { include: { host: true } } },
        });
      }
    }
    if (!invitation) throw AppError.notFound("Invitation not found");
    return this.formatInvitationResponse(invitation);
  }

  async getInvitationByToken(token) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { guest: true, event: true },
    });
    if (!invitation) throw AppError.notFound("Invitation not found");
    return invitation;
  }

  async listInvitations(eventId, where = {}, skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where: { eventId, ...where },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { guest: true },
      }),
      this.prisma.invitation.count({ where: { eventId, ...where } }),
    ]);
    return { data, total };
  }

  async createInvitation(eventId, guestData) {
    const guest = await this.prisma.guest.create({
      data: { ...guestData, eventId },
    });

    const invitation = await this.prisma.invitation.create({
      data: { eventId, guestId: guest.id },
      include: { guest: true, event: true },
    });

    const qrToken = QrUtils.signQRToken(invitation.id, eventId);
    await this.prisma.qRCode.create({
      data: { code: qrToken, eventId, invitationId: invitation.id },
    });

    logger.info("Invitation created", {
      invitationId: invitation.id,
      eventId,
      guestId: guest.id,
    });

    return { invitation: this.formatInvitationResponse(invitation), guest };
  }

  async bulkCreateInvitations(eventId, guests) {
    const created = [];
    for (const g of guests) {
      const guest = await this.prisma.guest.create({
        data: { ...g, eventId },
      }).catch(() => null);
      if (!guest) continue;

      const invitation = await this.prisma.invitation.create({
        data: { eventId, guestId: guest.id },
      });

      const qrToken = QrUtils.signQRToken(invitation.id, eventId);
      await this.prisma.qRCode.create({
        data: { code: qrToken, eventId, invitationId: invitation.id },
      });

      created.push({ guest, invitation, qrToken });
    }
    return { created: created.length, total: guests.length };
  }

  async rsvp(token, status) {
    const invitation = await this.getInvitationByToken(token);

    if (invitation.status === "CHECKED_IN") {
      throw AppError.badRequest("Cannot change RSVP after check-in");
    }

    const statusMap = { YES: "ACCEPTED", NO: "DECLINED", MAYBE: "PENDING" };
    const dbStatus = statusMap[status] || "PENDING";

    const updated = await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: dbStatus, rsvpAt: new Date() },
    });

    logger.info("RSVP updated", {
      invitationId: invitation.id,
      status: dbStatus,
    });

    return updated;
  }

  async resendInvitation(invitationId) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { guest: true, event: true },
    });
    if (!invitation) throw AppError.notFound("Invitation not found");

    const invitationLink = `${BASE_URL}/rsvp/${invitation.event.eventCode}/${invitation.token}`;

    let qrBase64 = null;
    try {
      const qrDataUrl = await QRCode.toDataURL(invitation.token, {
        errorCorrectionLevel: "H",
        width: 300,
      });
      qrBase64 = qrDataUrl.split(",")[1];
    } catch (err) {
      logger.error("QR generation failed for resend", { error: err.message });
    }

    if (invitation.guest?.email) {
      await emailQueue.add("send_invitation", {
        guest: invitation.guest,
        event: invitation.event,
        invitationLink,
        qrImageBase64: qrBase64,
        invitationId: invitation.id,
      });
    }

    await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { sentAt: new Date(), sentBy: "resend" },
    });

    logger.info("Invitation resent", { invitationId });

    return true;
  }

  formatInvitationResponse(invitation) {
    return {
      id: invitation.id,
      status: invitation.status,
      token: invitation.token,
      sentAt: invitation.sentAt,
      rsvpAt: invitation.rsvpAt,
      createdAt: invitation.createdAt,
      guest: invitation.guest
        ? {
            id: invitation.guest.id,
            fullName: invitation.guest.fullName,
            email: invitation.guest.email,
            phone: invitation.guest.phone,
          }
        : null,
      event: invitation.event
        ? {
            id: invitation.event.id,
            title: invitation.event.title,
            eventCode: invitation.event.eventCode,
            startDate: invitation.event.startDate,
            endDate: invitation.event.endDate,
          }
        : null,
    };
  }
}
