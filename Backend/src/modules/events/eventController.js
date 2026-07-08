/**
 * Event Controller
 * Handles HTTP requests for event endpoints
 */

import { BaseController } from "../../shared/base/BaseController.js";
import { EventService } from "./eventService.js";
import { AppError } from "../../shared/utils/AppError.js";
import { prisma } from "../../shared/utils/prisma.js";

class EventController extends BaseController {
  constructor() {
    super();
    this.eventService = new EventService(prisma);
  }

  /**
   * POST /events
   * Create a new event
   */
  createEvent = this.asyncHandler(async (req, res) => {
    const {
      title,
      description,
      eventCategory,
      venueName,
      address,
      coverUrl,
      themeAccent,
      rsvpDeadline,
      startDate,
      endDate,
      maxGuests,
      location,
    } = req.body;
    const hostId = req.user.id;

    // Validate capacity
    if (maxGuests < 1 || maxGuests > 10000) {
      return this.badRequest(res, "Max guests must be between 1 and 10000");
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return this.badRequest(res, "Start date must be before end date");
    }

    if (rsvpDeadline) {
      const rsvpDate = new Date(rsvpDeadline);
      if (rsvpDate >= start) {
        return this.badRequest(
          res,
          "RSVP deadline must be before the event start date"
        );
      }
    }

    const event = await this.eventService.createEvent({
      title,
      description,
      eventCategory,
      venueName,
      address,
      coverUrl,
      themeAccent,
      rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
      startDate: start,
      endDate: end,
      maxGuests,
      location,
      hostId,
    });

    this.created(res, "Event created successfully", event);
  });

  /**
   * GET /events/:eventId
   * Get event details
   */
  getEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const event = await this.eventService.getEvent(eventId);
    this.success(res, "Event retrieved", event);
  });

  /**
   * GET /events
   * List all events for authenticated host
   */
  listEvents = this.asyncHandler(async (req, res) => {
    const { status } = req.query;
    const hostId = req.user.id;

    const {
      page: validPage,
      limit: validLimit,
      skip,
    } = this.getPaginationParams(req);

    const filter = {};
    if (status) filter.status = status;

    const { data, total } = await this.eventService.getHostEvents(
      hostId,
      filter,
      skip,
      validLimit
    );

    this.paginated(res, data, validPage, validLimit, total, "Events retrieved");
  });

  /**
   * PUT /events/:eventId
   * Update event details
   */
  updateEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only edit your own events");
    }

    // Cannot update draft events after they're published
    if (event.status !== "DRAFT") {
      return this.badRequest(res, "Can only update draft events");
    }

    const updateData = {};

    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.eventCategory)
      updateData.eventCategory = req.body.eventCategory;
    if (req.body.venueName) updateData.venueName = req.body.venueName;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.coverUrl) updateData.coverUrl = req.body.coverUrl;
    if (req.body.themeAccent) updateData.themeAccent = req.body.themeAccent;
    if (req.body.rsvpDeadline)
      updateData.rsvpDeadline = new Date(req.body.rsvpDeadline);
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.maxGuests) {
      if (req.body.maxGuests < 1 || req.body.maxGuests > 10000) {
        return this.badRequest(res, "Max guests must be between 1 and 10000");
      }
      updateData.maxGuests = req.body.maxGuests;
    }

    if (updateData.startDate && updateData.endDate) {
      if (updateData.startDate >= updateData.endDate) {
        return this.badRequest(res, "Start date must be before end date");
      }
    }

    if (updateData.startDate && event.rsvpDeadline) {
      if (updateData.startDate <= event.rsvpDeadline) {
        return this.badRequest(
          res,
          "Event start date must be after the existing RSVP deadline"
        );
      }
    }

    if (updateData.rsvpDeadline) {
      const startDateToCompare = updateData.startDate || event.startDate;
      if (startDateToCompare && updateData.rsvpDeadline >= startDateToCompare) {
        return this.badRequest(
          res,
          "RSVP deadline must be before the event start date"
        );
      }
    }

    const updated = await this.eventService.updateEvent(eventId, updateData);
    this.success(res, "Event updated successfully", updated);
  });

  /**
   * POST /events/:eventId/publish
   * Publish event (make it active for invitations)
   */
  publishEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only publish your own events");
    }

    const published = await this.eventService.publishEvent(eventId);
    this.success(res, "Event published successfully", published);
  });

  /**
   * POST /events/:eventId/start
   * Start event (mark as ongoing)
   */
  startEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only start your own events");
    }

    const started = await this.eventService.startEvent(eventId);
    this.success(res, "Event started", started);
  });

  /**
   * POST /events/:eventId/end
   * End event (mark as completed)
   */
  endEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only end your own events");
    }

    const ended = await this.eventService.endEvent(eventId);
    this.success(res, "Event ended", ended);
  });

  /**
   * DELETE /events/:eventId
   * Delete event (only draft or completed)
   */
  deleteEvent = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only delete your own events");
    }

    await this.eventService.deleteEvent(eventId);
    this.success(res, "Event deleted successfully");
  });

  /**
   * GET /events/:eventId/capacity
   * Check event capacity
   */
  checkCapacity = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const capacity = await this.eventService.checkCapacity(eventId);
    this.success(res, "Capacity info retrieved", capacity);
  });

  /**
   * GET /events/:eventId/dashboard
   * Get event dashboard with stats
   */
  getDashboard = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const hostId = req.user.id;

    // Verify ownership
    const event = await this.eventService.findById(eventId);
    if (!event) {
      return this.notFound(res, "Event not found");
    }

    if (event.hostId !== hostId) {
      return this.forbidden(res, "You can only view your own event dashboard");
    }

    const dashboard = await this.eventService.getEventDashboard(eventId);
    this.success(res, "Dashboard retrieved", dashboard);
  });
}

export default new EventController();
