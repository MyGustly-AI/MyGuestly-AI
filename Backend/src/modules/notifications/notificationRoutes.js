import { Router } from "express";
import notificationController from "./notificationController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  notificationController.list,
);

router.patch(
  "/:id/read",
  authenticate,
  notificationController.markAsRead,
);

router.patch(
  "/read-all",
  authenticate,
  notificationController.markAllAsRead,
);

export default router;
