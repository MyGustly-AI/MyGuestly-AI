import { BaseService } from "./BaseService.js";
import { AppError } from "../utils/AppError.js";

export class GuestService extends BaseService {
  constructor(prisma) {
    super(prisma, prisma.guest);
    this.prisma = prisma;
  }

  async inviteGuest(eventId, guestData) {
    try {
      // Check for existing guest by email or phone for this event
      const where = {
        eventId,
        OR: [],
      };
      if (guestData.email) where.OR.push({ email: guestData.email });
      if (guestData.phone) where.OR.push({ phone: guestData.phone });

      if (where.OR.length > 0) {
        const existing = await this.model.findFirst({ where });
        if (existing) {
          // Return existing guest instead of attempting a duplicate create
          return { ...existing, _existing: true };
        }
      }

      const guest = await this.create({
        ...guestData,
        eventId,
      });

      return { ...guest, _existing: false };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkInviteGuests(eventId, guests) {
    try {
      const payload = guests.map((guest) => ({
        ...guest,
        eventId,
      }));

      const result = await this.createMany(payload);
      return {
        invited: result.count,
        requested: payload.length,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrCreateInvitation(eventId, guestId) {
    try {
      const existing = await this.prisma.invitation.findFirst({
        where: { guestId, eventId },
      });

      if (existing) return existing;

      const created = await this.prisma.invitation.create({
        data: {
          guestId,
          eventId,
        },
      });

      return created;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRsvp(eventId, guestId, status) {
    try {
      const guest = await this.findById(guestId);
      if (guest.eventId !== eventId) {
        throw AppError.badRequest("Guest does not belong to this event");
      }

      const updated = await this.update(guestId, {
        rsvpStatus: status,
      });

      return updated;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listGuests(eventId, where = {}, skip = 0, take = 10) {
    try {
      const filter = { eventId, ...where };
      const [records, total] = await Promise.all([
        this.model.findMany({
          where: filter,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        this.model.count({ where: filter }),
      ]);

      return { data: records, total };
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
