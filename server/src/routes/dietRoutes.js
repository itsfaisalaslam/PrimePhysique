import express from "express";
import { getDietPlans } from "../controllers/dietController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDietPlans);

export default router;
