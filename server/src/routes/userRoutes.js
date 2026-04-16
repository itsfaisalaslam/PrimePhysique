import express from "express";
import { getProfile, getCurrentUser, getUsersList, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Required protected profile routes
router.get("/", protect, getUsersList);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Backward-compatible route for existing frontend code.
router.get("/me", protect, getCurrentUser);

export default router;
