/**
 * Event Service
 * Handles all event-related business logic
 */

import { BaseService } from "../../shared/base/BaseService.js";
import { AppError } from "../../shared/utils/AppError.js";
import { QRUtil } from "../../shared/utils/helpers.js";
import { logger } from "../../infra/loggers/logger.js";

export class EventService extends BaseService {
  constructor(prisma) {
    super(prisma, prisma.event);
    this.prisma = prisma;
  }

  /**
   * Create Event
   * @param {Object} eventData - { title, description, eventCategory, venueName, address, coverUrl, themeAccent, rsvpDeadline, startDate, endDate, maxGuests, location, hostId }
   * @returns {Object} - Created event with QR code token
   */
  async createEvent(eventData) {
    try {
      const eventCode = QRUtil.generateEventCode();

      const existing = await this.findOne({ eventCode });
      if (existing) {
        return this.createEvent(eventData);
      }

      const event = await this.create({
        ...eventData,
        eventCode,
        status: "DRAFT",
      });

      logger.info("Event created", {
        eventId: event.id,
        hostId: event.hostId,
        eventCode,
      });

      return this.formatEventResponse(event);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Event by ID with stats
   * @param {String} eventId - Event ID
   * @returns {Object} - Event with guest count and RSVP stats
   */
  async getEvent(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      // Get guest statistics from invitations (Invitation.status holds RSVP status)
      const [guestStats, totalGuests, checkInCount] = await Promise.all([
        this.prisma.invitation.groupBy({
          by: ["status"],
          where: { eventId },
          _count: true,
        }),
        this.prisma.guest.count({ where: { eventId } }),
        this.prisma.checkIn.count({ where: { eventId } }),
      ]);

      const stats = {
        total: totalGuests,
        confirmed: 0,
        declined: 0,
        pending: 0,
      };

      guestStats.forEach((stat) => {
        if (stat.status === "ACCEPTED") stats.confirmed = stat._count;
        else if (stat.status === "DECLINED") stats.declined = stat._count;
      });

      stats.pending = Math.max(0, stats.total - stats.confirmed - stats.declined - checkInCount);

      return {
        ...event,
        stats,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List Events by Host
   * @param {String} hostId - Host user ID
   * @param {Number} skip - Pagination skip
   * @param {Number} take - Pagination limit
   * @returns {Object} - { data: events[], total: count }
   */
  async getHostEvents(hostId, where = {}, skip = 0, take = 10) {
    try {
      const filter = { hostId, ...where };
      const [result] = await Promise.all([
        this.findAll(filter, skip, take, { createdAt: "desc" }),
      ]);
      return { data: result.data, total: result.total };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update Event
   * @param {String} eventId - Event ID
   * @param {Object} updateData - Fields to update
   * @returns {Object} - Updated event
   */
  async updateEvent(eventId, updateData) {
    try {
      // Cannot update event code or status through this method
      const { eventCode, status, ...safeData } = updateData;

      const event = await this.update(eventId, safeData);
      return this.formatEventResponse(event);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Publish Event (activate for guests)
   * @param {String} eventId - Event ID
   * @returns {Object} - Updated event with ACTIVE status
   */
  async publishEvent(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      if (event.status === "ACTIVE") {
        throw AppError.conflict("Event is already published");
      }

      if (event.status !== "DRAFT") {
        throw AppError.badRequest("Only draft events can be published");
      }

      // Update status
      const updated = await this.update(eventId, {
        status: "ACTIVE",
        publishedAt: new Date(),
      });

      return this.formatEventResponse(updated);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start Event (mark as ongoing)
   * @param {String} eventId - Event ID
   * @returns {Object} - Updated event with ONGOING status
   */
  async startEvent(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      if (event.status !== "ACTIVE") {
        throw AppError.badRequest("Only published events can be started");
      }

      const updated = await this.update(eventId, {
        status: "ONGOING",
        startedAt: new Date(),
      });

      return this.formatEventResponse(updated);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * End Event (mark as completed)
   * @param {String} eventId - Event ID
   * @returns {Object} - Updated event with COMPLETED status
   */
  async endEvent(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      if (!["ACTIVE", "ONGOING"].includes(event.status)) {
        throw AppError.badRequest("Invalid event status for ending");
      }

      const updated = await this.update(eventId, {
        status: "COMPLETED",
        endedAt: new Date(),
      });

      return this.formatEventResponse(updated);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete Event
   * @param {String} eventId - Event ID
   * @returns {Boolean} - Success
   */
  async deleteEvent(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      // Only draft or completed events can be deleted
      if (!["DRAFT", "COMPLETED"].includes(event.status)) {
        throw AppError.badRequest(
          "Cannot delete active or ongoing events. Archive instead."
        );
      }

      // Delete all related data (guests, media, etc.)
      await this.prisma.guest.deleteMany({ where: { eventId } });
      await this.prisma.media.deleteMany({ where: { eventId } });

      // Delete event
      await this.delete(eventId);

      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check Capacity
   * @param {String} eventId - Event ID
   * @returns {Object} - { maxGuests, currentGuests, availableSpots, isFull }
   */
  async checkCapacity(eventId) {
    try {
      const event = await this.findById(eventId);

      if (!event) {
        throw AppError.notFound("Event not found");
      }

      const guestCount = await this.prisma.invitation.count({
        where: { eventId, status: "ACCEPTED" },
      });

      const availableSpots = Math.max(0, event.maxGuests - guestCount);
      const percentage =
        event.maxGuests > 0
          ? Math.round((guestCount / event.maxGuests) * 100)
          : 0;

      return {
        maxGuests: event.maxGuests,
        confirmedGuests: guestCount,
        availableSpots,
        isFull: event.maxGuests > 0 ? availableSpots === 0 : false,
        percentage,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Event Dashboard Stats
   * @param {String} eventId - Event ID
   * @returns {Object} - Comprehensive event statistics
   */
  async getEventDashboard(eventId) {
    try {
      const event = await this.getEvent(eventId);

      // Get check-in stats
      const checkIns = await this.prisma.checkIn.count({
        where: { eventId },
      });

      const mediaCount = await this.prisma.media.count({
        where: { eventId },
      });

      // Get capacity info
      const capacity = await this.checkCapacity(eventId);

      return {
        event: {
          id: event.id,
          title: event.title,
          eventCode: event.eventCode,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate,
        },
        guests: event.stats,
        capacity,
        checkIns,
        media: mediaCount,
        publishedAt: event.publishedAt,
        startedAt: event.startedAt,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format Event Response
   * @private
   */
  formatEventResponse(event) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      eventCategory: event.eventCategory || null,
      venueName: event.venueName || null,
      address: event.address || null,
      coverUrl: event.coverUrl || null,
      themeAccent: event.themeAccent || null,
      rsvpDeadline: event.rsvpDeadline || null,
      eventCode: event.eventCode,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location || null,
      maxGuests: event.maxGuests,
      publishedAt: event.publishedAt || null,
      startedAt: event.startedAt || null,
      endedAt: event.endedAt || null,
      hostId: event.hostId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}

export default EventService;
