import { Router } from "express";
import {register, login, refresh, logout, me, updateMyProfile, changePassword, deleteMyAccount} from "./authController.js";
import { authenticate } from "../../middlewares/authenticateMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "./authValidation.js";
import { loginLimiter } from "../../middlewares/rateLimitMiddleware.js";


const router = Router();

router.post("/register", validate(registerSchema), register); // Registration route to create new user and generate tokens
router.post("/login", loginLimiter, validate(loginSchema), login); // Login route to authenticate user and generate tokens
router.post("/refresh", refresh); // Refresh token route to generate new access token using refresh token
router.post("/logout", authenticate, logout); // Logout route to invalidate tokens

router.get("/me", authenticate, me); // Get current user info route (protected)
router.patch("/profile", authenticate, validate(updateProfileSchema), updateMyProfile); // Update user profile route (protected)
router.patch("/password", authenticate, validate(changePasswordSchema), changePassword); // Change password route (protected)

router.delete("/account", authenticate, deleteMyAccount); // Delete user account route (protected)

export default router;