import { Router } from "express";
import analyticsController from "./analyticsController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";

const router = Router();

router.get(
  "/events/:eventId/overview",
  authenticate,
  authorize("HOST"),
  analyticsController.overview,
);

router.get(
  "/events/:eventId/demographics",
  authenticate,
  authorize("HOST"),
  analyticsController.demographics,
);

router.get(
  "/events/:eventId/engagement",
  authenticate,
  authorize("HOST"),
  analyticsController.engagement,
);

export default router;
