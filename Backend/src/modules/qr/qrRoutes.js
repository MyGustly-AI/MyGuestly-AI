import { Router } from "express";
import qrController from "./qrController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";
import { idempotency } from "../../middlewares/idempotencyMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { scanSchema } from "./qrValidation.js";

const router = Router();

router.post(
  "/scan",
  authenticate,
  authorize("HOST", "PHOTOGRAPHER"),
  idempotency,
  validate(scanSchema),
  qrController.scan,
);

router.get(
  "/events/:eventId/checkins",
  authenticate,
  authorize("HOST"),
  qrController.listCheckins,
);

router.get(
  "/events/:eventId/checkins/live",
  qrController.liveCount,
);

export default router;
