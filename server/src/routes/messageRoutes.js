import express from "express";
import { getChatHistory } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/:userId", getChatHistory);

export default router;
