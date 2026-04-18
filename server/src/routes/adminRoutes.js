import express from "express";
import {
  assignTrainerToUser,
  autoGenerateNotifications,
  broadcastNotification,
  createDietPlan,
  createPaymentForUser,
  createWorkoutPlan,
  deleteDietPlan,
  deleteUser,
  deleteWorkoutPlan,
  getAttendanceOverview,
  getAnalyticsOverview,
  getMembershipOverview,
  getAuditLogs,
  getAdminDashboardStats,
  getAllUsers,
  getAdminDiets,
  getAdminWorkouts,
  getAllTrainers,
  getTrainerClients,
  getUserAttendanceAdmin,
  getUserPaymentsAdmin,
  markAttendance,
  sendNotificationToUser,
  updateExpiryStatus,
  updateUserMembership,
  updateDietPlan,
  updateWorkoutPlan
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboardStats);
router.get("/analytics", protect, adminOnly, getAnalyticsOverview);
router.get("/audit-logs", protect, adminOnly, getAuditLogs);
router.get("/membership-overview", protect, adminOnly, getMembershipOverview);
router.get("/attendance-overview", protect, adminOnly, getAttendanceOverview);
router.put("/users/update-expiry-status", protect, adminOnly, updateExpiryStatus);
router.get("/trainers", protect, adminOnly, getAllTrainers);
router.get("/trainers/:id/clients", protect, adminOnly, getTrainerClients);
router.post("/notifications/broadcast", protect, adminOnly, broadcastNotification);
router.post("/notifications/auto-generate", protect, adminOnly, autoGenerateNotifications);

// View all users in MongoDB.
router.get("/users", protect, adminOnly, getAllUsers);

router.use(protect, adminOnly);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/membership", updateUserMembership);
router.put("/users/:id/assign-trainer", assignTrainerToUser);
router.post("/notifications/user/:id", sendNotificationToUser);
router.post("/users/:id/payments", createPaymentForUser);
router.get("/users/:id/payments", getUserPaymentsAdmin);
router.post("/users/:id/attendance", markAttendance);
router.get("/users/:id/attendance", getUserAttendanceAdmin);
router.get("/workouts", getAdminWorkouts);
router.post("/workouts", createWorkoutPlan);
router.put("/workouts/:id", updateWorkoutPlan);
router.delete("/workouts/:id", deleteWorkoutPlan);
router.get("/diets", getAdminDiets);
router.post("/diets", createDietPlan);
router.put("/diets/:id", updateDietPlan);
router.delete("/diets/:id", deleteDietPlan);

export default router;
