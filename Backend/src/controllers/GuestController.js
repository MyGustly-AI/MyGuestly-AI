import { BaseController } from "./BaseController.js";
import { GuestService } from "../services/GuestService.js";
import { EventService } from "../services/EventService.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

class GuestController extends BaseController {
  constructor() {
    super();
    this.guestService = new GuestService(prisma);
    this.eventService = new EventService(prisma);
  }

  inviteGuest = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { name, email, phone } = req.body;

    const event = await this.eventService.findById(eventId);
    if (event.hostId !== hostId) {
      return this.forbidden(
        res,
        "You can only invite guests to your own event",
      );
    }

    const guest = await this.guestService.inviteGuest(eventId, {
      name,
      email,
      phone,
    });

    const invitation = {
      guestId: guest.id,
      eventId: event.id,
      eventTitle: event.title,
      eventCode: event.eventCode,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
      location: event.location,
      qrToken: guest.qrToken,
      invitationLink: `${BASE_URL}/rsvp/${event.eventCode}/${guest.qrToken}`,
      rsvpStatus: guest.rsvpStatus,
    };

    this.created(res, "Guest invited successfully", {
      guest,
      invitation,
    });
  });

  bulkInviteGuests = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { guests } = req.body;

    const event = await this.eventService.findById(eventId);
    if (event.hostId !== hostId) {
      return this.forbidden(
        res,
        "You can only invite guests to your own event",
      );
    }

    const result = await this.guestService.bulkInviteGuests(eventId, guests);
    this.created(res, "Guest invitations created", result);
  });

  updateRsvp = this.asyncHandler(async (req, res) => {
    const { eventId, guestId } = req.params;
    const { status } = req.body;

    const guest = await this.guestService.findById(guestId);
    if (guest.eventId !== eventId) {
      return this.badRequest(res, "Guest does not belong to this event");
    }

    const updated = await this.guestService.updateRsvp(
      eventId,
      guestId,
      status,
    );
    this.success(res, "RSVP status updated", updated);
  });

  listGuests = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { status } = req.query;

    const event = await this.eventService.findById(eventId);
    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only view guests for your own event");
    }

    const {
      page: validPage,
      limit: validLimit,
      skip,
    } = this.getPaginationParams(req);
    const filter = {};
    if (status) filter.rsvpStatus = status;

    const { data, total } = await this.guestService.listGuests(
      eventId,
      filter,
      skip,
      validLimit,
    );
    this.paginated(
      res,
      data,
      validPage,
      validLimit,
      total,
      "Guest list retrieved",
    );
  });
}

export default new GuestController();
