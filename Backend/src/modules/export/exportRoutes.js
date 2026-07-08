import { Router } from "express";
import exportController from "./exportController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";

const router = Router();

router.get(
  "/events/:eventId/guests",
  authenticate,
  authorize("HOST"),
  exportController.guests,
);

router.get(
  "/events/:eventId/checkins",
  authenticate,
  authorize("HOST"),
  exportController.checkIns,
);

export default router;
