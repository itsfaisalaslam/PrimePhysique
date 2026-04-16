import express from "express";
import { createProgressEntry, getProgressEntries } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProgressEntries);
router.post("/", protect, createProgressEntry);

export default router;
