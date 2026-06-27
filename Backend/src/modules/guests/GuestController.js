import { BaseController } from "../../shared/base/BaseController.js";
import { GuestService } from "./guestService.js";
import { EventService } from "../events/eventService.js";
import { AppError } from "../../shared/utils/AppError.js";
import { prisma } from "../../shared/utils/prisma.js";
import { emailQueue } from "../../infra/queues/emailQueue.js";
import QRCode from "qrcode";
import env from "../../config/env.js";
import { logger } from "../../infra/loggers/logger.js";

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
    const { fullName, email, phone } = req.body;

    const event = await this.eventService.findById(eventId, {
      id: true, hostId: true, title: true, eventCode: true,
      startDate: true, endDate: true, location: true,
    });
    if (event.hostId !== hostId) {
      return this.forbidden(
        res,
        "You can only invite guests to your own event"
      );
    }

    const guestResult = await this.guestService.inviteGuest(eventId, {
      fullName: fullName,
      email,
      phone,
    });

    // guestResult may include an _existing flag when a duplicate was detected
    const guest = (({ _existing, ...rest }) => rest)(guestResult);
    const wasExisting = !!guestResult._existing;

    // Ensure there is an Invitation DB row and get its token
    let invitationRecord;
    try {
      invitationRecord = await this.guestService.getOrCreateInvitation(
        event.id,
        guest.id,
      );
    } catch (err) {
      console.error(
        "Failed to create/find invitation record:",
        err?.message || err,
      );
      return this.internalError(res, "Failed to create invitation record");
    }

    const invitation = {
      guestId: guest.id,
      eventId: event.id,
      eventTitle: event.title,
      eventCode: event.eventCode,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
      location: event.location,
      token: invitationRecord.token,
      invitationLink: `${BASE_URL}/rsvp/${event.eventCode}/${invitationRecord.token}`,
      rsvpStatus: guest.rsvpStatus,
    };

    // Generate QR image for the invitation token (data URL -> base64)
    let qrBase64 = null;
    try {
      const qrDataUrl = await QRCode.toDataURL(invitation.token, {
        errorCorrectionLevel: "H",
        width: 300,
      });
      qrBase64 = qrDataUrl.split(",")[1];
    } catch (err) {
      console.error("Failed to generate QR code image:", err?.message || err);
    }

    // Enqueue invitation email job so sending doesn't block the API
    let mailResult = null;
    if (guest.email) {
      try {
        const job = await emailQueue.add(
          "invitation",
          {
            guest,
            event,
            invitationLink: invitation.invitationLink,
            qrImageBase64: qrBase64,
            invitationId: invitationRecord.id,
            hostId,
          },
          { attempts: 3, backoff: { type: "exponential", delay: 60000 } },
        );
        mailResult = { enqueued: true, jobId: job.id };
        logger.info("Invitation email job queued", {
          eventId: event.id,
          guestId: guest.id,
          invitationId: invitationRecord.id,
          guestEmail: guest.email,
          jobId: job.id,
        });
      } catch (err) {
        logger.error("Failed to enqueue invitation email", {
          eventId: event.id,
          guestId: guest.id,
          invitationId: invitationRecord?.id,
          guestEmail: guest.email,
          error: err?.message || err,
        });
        console.error(
          "Failed to enqueue invitation email:",
          err?.message || err,
        );
      }
    }

    this.created(res, "Guest invited successfully", {
      guest,
      invitation,
      existing: wasExisting,
      mail: mailResult || { enqueued: false },
    });
  });

  bulkInviteGuests = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { guests } = req.body;

    const event = await this.eventService.findById(eventId, {
      id: true, hostId: true, title: true, eventCode: true, location: true,
    });
    if (event.hostId !== hostId) {
      return this.forbidden(
        res,
        "You can only invite guests to your own event"
      );
    }

    // Ensure bulk payloads map `name` -> `fullName` for DB compatibility
    const normalized = guests.map((g) => ({
      fullName: g.fullName || g.name,
      email: g.email,
      phone: g.phone,
    }));

    const result = await this.guestService.bulkInviteGuests(
      eventId,
      normalized,
    );

    // Enqueue emails in parallel (no sequential await)
    const invites = guests
      .filter((g) => g.email)
      .map((g) => ({ fullName: g.fullName || g.name, email: g.email }));

    const invitationLink = `${BASE_URL}/rsvp/${event.eventCode}`;

    await Promise.allSettled(
      invites.map((g) =>
        emailQueue
          .add(
            "invitation",
            { guest: { fullName: g.fullName, email: g.email }, event, invitationLink },
            { attempts: 3, backoff: { type: "exponential", delay: 60000 } },
          )
          .then((job) => {
            logger.info("Bulk invitation email job queued", {
              eventId: event.id,
              guestEmail: g.email,
              jobId: job.id,
            });
          })
          .catch((err) => {
            logger.error("Failed to enqueue bulk invitation email", {
              eventId: event.id,
              guestEmail: g.email,
              error: err?.message || err,
            });
          }),
      ),
    );

    this.created(res, "Guest invitations created", result);
  });

  updateRsvp = this.asyncHandler(async (req, res) => {
    const { eventId, guestId } = req.params;
    const { status } = req.body;

    const guest = await this.guestService.findById(guestId, { id: true, eventId: true });
    if (guest.eventId !== eventId) {
      return this.badRequest(res, "Guest does not belong to this event");
    }

    const updated = await this.guestService.updateRsvp(
      eventId,
      guestId,
      status
    );
    this.success(res, "RSVP status updated", updated);
  });

  listGuests = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;
    const { status } = req.query;

    const event = await this.eventService.findById(eventId, { id: true, hostId: true });
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
      validLimit
    );
    this.paginated(
      res,
      data,
      validPage,
      validLimit,
      total,
      "Guest list retrieved"
    );
  });
}

export default new GuestController();
