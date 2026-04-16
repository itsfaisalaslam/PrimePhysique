import DietPlan from "../models/DietPlan.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Admin users cannot be deleted from this panel.");
  }

  await user.deleteOne();
  res.json({ message: "User deleted." });
});

export const getAdminWorkouts = asyncHandler(async (req, res) => {
  const workoutPlans = await WorkoutPlan.find().sort({ createdAt: -1 });
  res.json({ workoutPlans });
});

export const createWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.create(req.body);
  res.status(201).json({ workoutPlan });
});

export const updateWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!workoutPlan) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  res.json({ workoutPlan });
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  const workoutPlan = await WorkoutPlan.findByIdAndDelete(req.params.id);

  if (!workoutPlan) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  await User.updateMany({}, { $pull: { assignedWorkoutPlans: workoutPlan._id } });
  res.json({ message: "Workout plan deleted." });
});

export const getAdminDiets = asyncHandler(async (req, res) => {
  const dietPlans = await DietPlan.find().sort({ createdAt: -1 });
  res.json({ dietPlans });
});

export const createDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.create(req.body);
  res.status(201).json({ dietPlan });
});

export const updateDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!dietPlan) {
    res.status(404);
    throw new Error("Diet plan not found.");
  }

  res.json({ dietPlan });
});

export const deleteDietPlan = asyncHandler(async (req, res) => {
  const dietPlan = await DietPlan.findByIdAndDelete(req.params.id);

  if (!dietPlan) {
    res.status(404);
    throw new Error("Diet plan not found.");
  }

  await User.updateMany({}, { $pull: { assignedDietPlans: dietPlan._id } });
  res.json({ message: "Diet plan deleted." });
});
