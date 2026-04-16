import express from "express";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// Required routes
router.post("/signup", signup);
router.post("/login", login);

// Backward-compatible route for the existing frontend in this repo.
router.post("/register", signup);

export default router;
