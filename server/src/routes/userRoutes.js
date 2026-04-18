import express from "express";
import {
  getProfile,
  getCurrentUser,
  getMyAttendance,
  getMyAttendanceSummary,
  getMyNotifications,
  getMyPayments,
  getUsersList,
  markNotificationAsRead,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Required protected profile routes
router.get("/", protect, getUsersList);
router.get("/payments", protect, getMyPayments);
router.get("/attendance", protect, getMyAttendance);
router.get("/attendance-summary", protect, getMyAttendanceSummary);
router.get("/notifications", protect, getMyNotifications);
router.put("/notifications/:id/read", protect, markNotificationAsRead);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Backward-compatible route for existing frontend code.
router.get("/me", protect, getCurrentUser);

export default router;
