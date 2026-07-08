import express from "express";
import mediaController from "./mediaController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { optionalAuth } from "../../middlewares/optionalAuthMiddleware.js";
import { validateRequest, validateQuery, mediaSchemas } from "../../shared/utils/validationSchemas.js";

const router = express.Router({ mergeParams: true }); // mergeParams to access eventId

// GET /events/:eventId/media/upload-url
router.get("/upload-url", authenticate, mediaController.getUploadUrl);

// POST /events/:eventId/media
router.post(
  "/",
  authenticate,
  validateRequest(mediaSchemas.upload),
  mediaController.registerMedia
);

// GET /events/:eventId/media
router.get(
  "/",
  optionalAuth,
  validateQuery(mediaSchemas.list),
  mediaController.listGallery
);

// POST /events/:eventId/media/:mediaId/voice-note
router.post(
  "/:mediaId/voice-note",
  authenticate,
  validateRequest(mediaSchemas.addVoiceNote),
  mediaController.addVoiceNote
);

// POST /events/:eventId/media/:mediaId/comments
router.post(
  "/:mediaId/comments",
  authenticate,
  mediaController.addComment
);

// POST /events/:eventId/media/:mediaId/likes
router.post(
  "/:mediaId/likes",
  authenticate,
  mediaController.toggleLike
);

export default router;
