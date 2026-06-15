import { Router } from "express";
import feedbackController from "./feedbackController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { createFeedbackSchema } from "./feedbackValidation.js";

const router = Router();

router.post(
  "/events/:eventId",
  validate(createFeedbackSchema),
  feedbackController.submit,
);

router.get(
  "/events/:eventId",
  authenticate,
  authorize("HOST"),
  feedbackController.list,
);

router.get(
  "/events/:eventId/summary",
  authenticate,
  authorize("HOST"),
  feedbackController.summary,
);

export default router;
