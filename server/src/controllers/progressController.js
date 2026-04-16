import Progress from "../models/Progress.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getProgressEntries = asyncHandler(async (req, res) => {
  const progressEntries = await Progress.find({ user: req.user._id }).sort({ date: 1 });
  res.json({ progressEntries });
});

export const createProgressEntry = asyncHandler(async (req, res) => {
  const { weight, performanceScore, notes } = req.body;

  const entry = await Progress.create({
    user: req.user._id,
    weight,
    performanceScore,
    notes
  });

  req.user.weight = weight;
  await req.user.save();

  res.status(201).json({
    message: "Progress entry created.",
    progress: entry
  });
});
