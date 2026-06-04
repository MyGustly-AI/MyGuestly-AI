import { BaseController } from "./BaseController.js";
import { GuestService } from "../services/GuestService.js";
import { EventService } from "../services/EventService.js";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import EmailService from "../utils/emailService.js";
import env from "../config/env.js";

const BASE_URL = env.APP_URL;

class GuestController extends BaseController {
  constructor() {
    super();
    this.guestService = new GuestService(prisma);
    this.eventService = new EventService(prisma);
  }

  inviteGuest = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { name, fullName, email, phone } = req.body;

    const event = await this.eventService.findById(eventId);
    if (event.hostId !== hostId) {
      return this.forbidden(
        res,
        "You can only invite guests to your own event",
      );
    }

    const guest = await this.guestService.inviteGuest(eventId, {
      fullName: fullName || name,
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

    // Send invitation email (if email present)
    try {
      await EmailService.sendInvitation({
        guest,
        event,
        invitationLink: invitation.invitationLink,
      });
    } catch (err) {
      // Log and continue — email failures shouldn't block creation
      console.error("Invitation email failed:", err?.message || err);
    }

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

    // Ensure bulk payloads map `name` -> `fullName` for DB compatibility
    const normalized = guests.map((g) => ({
      fullName: g.fullName || g.name,
      email: g.email,
      phone: g.phone,
    }));

    const result = await this.guestService.bulkInviteGuests(eventId, normalized);
    // Try sending emails for guests that have an email address
    try {
      const invites = guests
        .filter((g) => g.email)
        .map((g) => ({ name: g.name || g.fullName, email: g.email }));
      for (const g of invites) {
        // Create a lightweight guest record to generate link
        // Note: bulkInvite created records already, but we don't have their ids/qr tokens here.
        // For now, send a simple notification with event details and request they visit the RSVP page.
        const invitationLink = `${BASE_URL}/rsvp/${event.eventCode}`;
        await EmailService.sendMail({
          to: g.email,
          subject: `Invitation: ${event.title}`,
          html: `<p>Hi ${g.name || "Guest"},</p><p>You are invited to <strong>${event.title}</strong>. RSVP here: <a href="${invitationLink}">${invitationLink}</a></p>`,
        });
      }
    } catch (err) {
      console.error("Bulk invitation email(s) failed:", err?.message || err);
    }

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
