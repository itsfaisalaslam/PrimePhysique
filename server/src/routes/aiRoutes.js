import express from "express";
import { generateAIWorkout, saveGeneratedWorkout } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/workout", protect, generateAIWorkout);
router.post("/workout/save", protect, saveGeneratedWorkout);

export default router;
