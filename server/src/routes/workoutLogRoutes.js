import express from "express";
import {
  createWorkoutLog,
  getWorkoutLogs,
  getWorkoutStreak
} from "../controllers/workoutLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getWorkoutLogs);
router.post("/", createWorkoutLog);
router.get("/streak", getWorkoutStreak);

export default router;
