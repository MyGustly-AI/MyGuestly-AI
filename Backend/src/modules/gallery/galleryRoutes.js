import { Router } from "express";
import galleryController from "./galleryController.js";

const router = Router();

router.get(
  "/events/:eventCode",
  galleryController.listMedia,
);

router.get(
  "/events/:eventCode/media/:mediaId",
  galleryController.getMedia,
);

export default router;
