import { Router } from "express";
import socialController from "./socialController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { createCommentSchema } from "./socialValidation.js";

const router = Router({ mergeParams: true });

router.post(
  "/media/:mediaId/comments",
  authenticate,
  validate(createCommentSchema),
  socialController.addComment,
);

router.get(
  "/media/:mediaId/comments",
  socialController.listComments,
);

router.delete(
  "/comments/:commentId",
  authenticate,
  socialController.deleteComment,
);

router.post(
  "/media/:mediaId/like",
  authenticate,
  socialController.toggleLike,
);

router.get(
  "/media/:mediaId/likes/count",
  socialController.getLikeCount,
);

export default router;
