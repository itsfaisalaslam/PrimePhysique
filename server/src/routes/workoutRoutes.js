import express from "express";
import {
  assignPlansToUser,
  assignWorkoutToUser,
  createWorkout,
  deleteWorkout,
  getAllWorkouts,
  getMyWorkouts,
  getWorkoutById,
  getWorkoutPlans,
  updateWorkout
} from "../controllers/workoutController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Put specific protected routes before "/:id" so route matching stays correct.
router.get("/my", protect, getMyWorkouts);
router.post("/assign", protect, adminOnly, assignPlansToUser);
router.post("/", protect, adminOnly, createWorkout);
router.get("/", getAllWorkouts);
router.get("/:id", protect, getWorkoutById);
router.put("/:id", protect, adminOnly, updateWorkout);
router.delete("/:id", protect, adminOnly, deleteWorkout);

export default router;
