import { Router } from "express";
import aiController from "./aiController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";
import { categorizeMedia } from "../../controllers/ai.controllers.js";

const router = Router({ mergeParams: true });

router.get(
  "/events/:eventId/timeline",
  aiController.getTimeline,
);

router.post(
  "/events/:eventId/retag",
  authenticate,
  authorize("HOST"),
  aiController.retag,
);

router.post('/organize', categorizeMedia);

export default router;
