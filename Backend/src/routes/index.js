import { Router } from "express";
const router = Router();

import authRoutes from "../modules/auth/authRoutes.js";
import eventRoutes from "../modules/events/eventRoutes.js";
import invitationRoutes from "../modules/invitations/invitationRoutes.js";
import mediaRoutes from "../modules/media/mediaRoutes.js";
import aiRoutes from "../modules/ai/aiRoutes.js";
import qrRoutes from "../modules/qr/qrRoutes.js";
import memoryRoutes from "../modules/memories/memoryRoutes.js";
import socialRoutes from "../modules/social/socialRoutes.js";
import notificationRoutes from "../modules/notifications/notificationRoutes.js";
import dashboardRoutes from "../modules/dashboard/dashboardRoutes.js";
import analyticsRoutes from "../modules/analytics/analyticsRoutes.js";
import galleryRoutes from "../modules/gallery/galleryRoutes.js";
import exportRoutes from "../modules/export/exportRoutes.js";
import feedbackRoutes from "../modules/feedback/feedbackRoutes.js";
import verifyController from "../modules/verification/verifyController.js";

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/events/:eventId/memories", memoryRoutes);
router.use("/invitations", invitationRoutes);
router.use("/media", mediaRoutes);
router.use("/ai", aiRoutes);
router.use("/qr", qrRoutes);

router.use("/social", socialRoutes);
router.use("/notifications", notificationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/gallery", galleryRoutes);
router.use("/export", exportRoutes);
router.use("/feedback", feedbackRoutes);

router.post("/verify-gate/:token", verifyController.verifyGate);

export default router;
