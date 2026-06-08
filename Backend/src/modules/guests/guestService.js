import { BaseService } from "../../shared/base/BaseService.js";
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
          // If caller provided updated contact details, merge them into the existing record
          const updates = {};
          if (guestData.fullName && guestData.fullName !== existing.fullName)
            updates.fullName = guestData.fullName;

          // Check uniqueness before attempting to update email/phone to avoid P2002
          if (guestData.email && guestData.email !== existing.email) {
            const conflict = await this.model.findFirst({
              where: { eventId, email: guestData.email },
            });
            if (!conflict || conflict.id === existing.id) {
              updates.email = guestData.email;
            } else {
              // another guest already has this email for the event; skip updating email
              // keep existing email and log for debugging
              // eslint-disable-next-line no-console
              console.warn(
                `Skipping email update for guest ${existing.id}: email already used by ${conflict.id}`,
              );
            }
          }

          if (guestData.phone && guestData.phone !== existing.phone) {
            const conflictPhone = await this.model.findFirst({
              where: { eventId, phone: guestData.phone },
            });
            if (!conflictPhone || conflictPhone.id === existing.id) {
              updates.phone = guestData.phone;
            } else {
              // another guest already has this phone for the event; skip updating phone
              // eslint-disable-next-line no-console
              console.warn(
                `Skipping phone update for guest ${existing.id}: phone already used by ${conflictPhone.id}`,
              );
            }
          }

          if (Object.keys(updates).length > 0) {
            const patched = await this.model.update({
              where: { id: existing.id },
              data: updates,
            });
            return { ...patched, _existing: true };
          }

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

      // If confirming an RSVP, ensure event capacity is not exceeded
      if (status === "CONFIRMED") {
        const event = await this.prisma.event.findUnique({
          where: { id: eventId },
        });
        if (!event) throw AppError.notFound("Event not found");

        const confirmedCount = await this.model.count({
          where: { eventId, rsvpStatus: "CONFIRMED" },
        });
        if (event.maxGuests > 0 && confirmedCount >= event.maxGuests) {
          throw AppError.badRequest(
            "Event capacity reached. Cannot confirm RSVP.",
          );
        }
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
