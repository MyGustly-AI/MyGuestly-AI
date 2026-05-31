/**
 * Main Routes Index
 * Centralizes all API routes
 */

import express from "express";
import eventRoutes from "./eventRoutes.js";

const router = express.Router();

/**
 * API v1 Routes
 * /api/v1/*
 */

// Event routes
router.use("/events", eventRoutes);

// More routes will be added here:
// router.use("/guests", guestRoutes);
// router.use("/media", mediaRoutes);
// router.use("/auth", authRoutes);
// etc.

export default router;
