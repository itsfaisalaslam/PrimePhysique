import DietPlan from "../models/DietPlan.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getDietPlans = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find().sort({ createdAt: -1 });
  res.json({ dietPlans });
});
