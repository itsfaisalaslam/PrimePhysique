import express from "express";
import {
  createNotificationEntry,
  getNotifications,
  markNotificationAsRead
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.post("/", createNotificationEntry);
router.put("/:id/read", markNotificationAsRead);

export default router;
