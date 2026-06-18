/**
 * Event Routes
 * All event-related endpoints
 */

import express from "express";
import eventController from "./eventController.js";
import guestRoutes from "../guests/guestRoutes.js";
import mediaRoutes from "../media/mediaRoutes.js";
import memoryRoutes from "../memories/memoryRoutes.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { validateRequest, validateQuery } from "../../shared/utils/validationSchemas.js";
import { eventSchemas } from "../../shared/utils/validationSchemas.js";

const router = express.Router();

/**
 * POST /events
 * Create a new event
 * Auth: Required (HOST role)
 */
router.post(
  "/",
  authenticate,
  authorize("HOST"),
  validateRequest(eventSchemas.create),
  eventController.createEvent
);

/**
 * GET /events
 * List all events for authenticated host
 * Auth: Required
 */
router.get(
  "/",
  authenticate,
  validateQuery(eventSchemas.list),
  eventController.listEvents
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
  authenticate,
  authorize("HOST"),
  validateRequest(eventSchemas.update),
  eventController.updateEvent
);

/**
 * POST /events/:eventId/publish
 * Publish event (make active for invitations)
 * Auth: Required (event owner)
 */
router.post(
  "/:eventId/publish",
  authenticate,
  authorize("HOST"),
  eventController.publishEvent
);

/**
 * POST /events/:eventId/start
 * Start event (mark as ongoing)
 * Auth: Required (event owner)
 */
router.post("/:eventId/start",
  authenticate,
  authorize("HOST"),
  eventController.startEvent
);

/**
 * POST /events/:eventId/end
 * End event (mark as completed)
 * Auth: Required (event owner)
 */
router.post(
  "/:eventId/end",
  authenticate,
  authorize("HOST"),
  eventController.endEvent
);

/**
 * DELETE /events/:eventId
 * Delete event (only draft or completed)
 * Auth: Required (event owner)
 */
router.delete(
  "/:eventId",
  authenticate,
  authorize("HOST"),
  eventController.deleteEvent
);

// Nested guest routes for the invitation module
router.use("/:eventId/guests", guestRoutes);

// Nested media routes
router.use("/:eventId/media", mediaRoutes);

// Nested memory routes
router.use("/:eventId/memories", memoryRoutes);

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
  authenticate,
  authorize("HOST"),
  eventController.getDashboard
);

export default router;
