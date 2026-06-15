import { Router } from "express";
import dashboardController from "./dashboardController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";

const router = Router();

router.get(
  "/overview",
  authenticate,
  authorize("HOST"),
  dashboardController.overview,
);

router.get(
  "/events/:eventId/live",
  dashboardController.liveStats,
);

export default router;
