/**
 * Event Routes
 * All event-related endpoints
 */

import express from "express";
import eventController from "../controllers/EventController.js";
import guestRoutes from "./guestRoutes.js";
import { authMiddleware, authorize } from "../middlewares/auth.js";
import { validateRequest, validateQuery } from "../utils/validationSchemas.js";
import { eventSchemas } from "../utils/validationSchemas.js";

const router = express.Router();

/**
 * POST /events
 * Create a new event
 * Auth: Required (HOST role)
 */
router.post(
  "/",
  authMiddleware,
  authorize("HOST"),
  validateRequest(eventSchemas.create),
  eventController.createEvent,
);

/**
 * GET /events
 * List all events for authenticated host
 * Auth: Required
 */
router.get(
  "/",
  authMiddleware,
  validateQuery(eventSchemas.list),
  eventController.listEvents,
);

/**
 * GET /events/:eventId
 * Get event details
 * Auth: Optional (public can view published events)
 */
router.get("/:eventId", eventController.getEvent);

/**
 * PUT /events/:eventId
 * Update event details
 * Auth: Required (event owner)
 */
router.put(
  "/:eventId",
  authMiddleware,
  authorize("HOST"),
  validateRequest(eventSchemas.update),
  eventController.updateEvent,
);

/**
 * POST /events/:eventId/publish
 * Publish event (make active for invitations)
 * Auth: Required (event owner)
 */
router.post(
  "/:eventId/publish",
  authMiddleware,
  authorize("HOST"),
  eventController.publishEvent,
);

/**
 * POST /events/:eventId/start
 * Start event (mark as ongoing)
 * Auth: Required (event owner)
 */
router.post(
  "/:eventId/start",
  authMiddleware,
  authorize("HOST"),
  eventController.startEvent,
);

/**
 * POST /events/:eventId/end
 * End event (mark as completed)
 * Auth: Required (event owner)
 */
router.post(
  "/:eventId/end",
  authMiddleware,
  authorize("HOST"),
  eventController.endEvent,
);

/**
 * DELETE /events/:eventId
 * Delete event (only draft or completed)
 * Auth: Required (event owner)
 */
router.delete(
  "/:eventId",
  authMiddleware,
  authorize("HOST"),
  eventController.deleteEvent,
);

// Nested guest routes for the invitation module
router.use("/:eventId/guests", guestRoutes);

/**
 * GET /events/:eventId/capacity
 * Check event capacity and guest count
 * Auth: Optional
 */
router.get("/:eventId/capacity", eventController.checkCapacity);

/**
 * GET /events/:eventId/dashboard
 * Get event dashboard with statistics
 * Auth: Required (event owner)
 */
router.get(
  "/:eventId/dashboard",
  authMiddleware,
  authorize("HOST"),
  eventController.getDashboard,
);

export default router;
