import express from "express";
import guestController from "./GuestController.js";
import { authMiddleware, authorize } from "../../../authMiddleware.js";
import {
  validateRequest,
  validateQuery,
  guestSchemas,
} from "../utils/validationSchemas.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  authorize("HOST"),
  validateRequest(guestSchemas.invite),
  guestController.inviteGuest
);

router.post(
  "/bulk-invite",
  authMiddleware,
  authorize("HOST"),
  validateRequest(guestSchemas.bulkInvite),
  guestController.bulkInviteGuests
);

router.get(
  "/",
  authMiddleware,
  authorize("HOST"),
  validateQuery(guestSchemas.list),
  guestController.listGuests
);

router.put(
  "/:guestId/rsvp",
  validateRequest(guestSchemas.updateRSVP),
  guestController.updateRsvp
);

export default router;
