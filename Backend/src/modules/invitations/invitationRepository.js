import prisma from "../../shared/utils/prisma.js";

export class InvitationRepository {
  findByToken(token) {
    return prisma.invitation.findUnique({
      where: { token },
      include: { guest: true, event: true, qrCode: true },
    });
  }

  findById(id) {
    return prisma.invitation.findUnique({
      where: { id },
      include: { guest: true, event: true, qrCode: true },
    });
  }

  findByGuestId(guestId) {
    return prisma.invitation.findUnique({ where: { guestId } });
  }

  findByEvent(eventId, where = {}, skip, take) {
    return prisma.invitation.findMany({
      where: { eventId, ...where },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { guest: true },
    });
  }

  countByEvent(eventId, where = {}) {
    return prisma.invitation.count({ where: { eventId, ...where } });
  }

  create(data) {
    return prisma.invitation.create({ data, include: { guest: true, event: true } });
  }

  update(id, data) {
    return prisma.invitation.update({ where: { id }, data });
  }

  createQRCode(data) {
    return prisma.qRCode.create({ data });
  }
}
