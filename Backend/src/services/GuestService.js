import { BaseService } from "./BaseService.js";
import { AppError } from "../utils/AppError.js";

export class GuestService extends BaseService {
  constructor(prisma) {
    super(prisma, prisma.guest);
    this.prisma = prisma;
  }

  async inviteGuest(eventId, guestData) {
    try {
      const guest = await this.create({
        ...guestData,
        eventId,
      });

      return guest;
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
