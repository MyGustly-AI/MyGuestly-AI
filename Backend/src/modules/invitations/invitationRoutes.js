import { Router } from "express";
import invitationController from "./invitationController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { authorize } from "../../middlewares/authorizeMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { rsvpSchema } from "./invitationValidation.js";

const router = Router({ mergeParams: true });

router.get(
  "/:invitationId",
  invitationController.getInvitation,
);

router.post(
  "/:invitationId/rsvp",
  validate(rsvpSchema),
  invitationController.rsvp,
);

router.post(
  "/:invitationId/resend",
  authenticate,
  authorize("HOST"),
  invitationController.resendInvitation,
);

export default router;
