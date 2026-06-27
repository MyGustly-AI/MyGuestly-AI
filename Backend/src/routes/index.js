import "dotenv/config"; // Must be the very first line
import { Router } from "express";
const router = Router();

import authRoutes from "../modules/auth/authRoutes.js";
import eventRoutes from "../modules/events/eventRoutes.js";
import verifyController from "../modules/verification/VerifyController.js";

router.use("/auth", authRoutes); // Authentication routes for user registration, login, token refresh, and logout
router.use("/events", eventRoutes); // Event routes for managing guest events, RSVPs, and related operations

// Gate verification endpoint (scanning QR at gate)
router.post("/verify-gate/:token", verifyController.verifyGate);

// More routes will be added here:
// router.use("/guests", guestRoutes);
// router.use("/media", mediaRoutes);


export default router;