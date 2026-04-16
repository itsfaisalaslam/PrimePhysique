import express from "express";
import {
  createDietPlan,
  createWorkoutPlan,
  deleteDietPlan,
  deleteUser,
  deleteWorkoutPlan,
  getAdminDiets,
  getAdminWorkouts,
  getUsers,
  updateDietPlan,
  updateWorkoutPlan
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/workouts", getAdminWorkouts);
router.post("/workouts", createWorkoutPlan);
router.put("/workouts/:id", updateWorkoutPlan);
router.delete("/workouts/:id", deleteWorkoutPlan);
router.get("/diets", getAdminDiets);
router.post("/diets", createDietPlan);
router.put("/diets/:id", updateDietPlan);
router.delete("/diets/:id", deleteDietPlan);

export default router;
