import express from "express";
import memoryController from "./memoryController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { optionalAuth } from "../../middlewares/optionalAuthMiddleware.js";
import { validateRequest, validateQuery, memorySchemas } from "../../shared/utils/validationSchemas.js";

const router = express.Router({ mergeParams: true });

// POST /events/:eventId/memories
router.post(
  "/",
  authenticate,
  validateRequest(memorySchemas.addMemory),
  memoryController.addMemory
);

// GET /events/:eventId/memories
router.get(
  "/",
  optionalAuth,
  validateQuery(memorySchemas.list),
  memoryController.listMemories
);

export default router;
