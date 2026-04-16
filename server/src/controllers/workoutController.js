import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { createNotification } from "../utils/notificationService.js";

export const createWorkout = asyncHandler(async (req, res) => {
  const { name, description, goal, exercises, level, daysPerWeek } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Workout name is required.");
  }

  const workout = await WorkoutPlan.create({
    name,
    description,
    goal,
    exercises,
    level,
    daysPerWeek,
    createdBy: req.user._id
  });

  res.status(201).json({
    message: "Workout plan created successfully.",
    workout
  });
});

export const getAllWorkouts = asyncHandler(async (req, res) => {
  const workouts = await WorkoutPlan.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ workouts });
});

export const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findById(req.params.id).populate("createdBy", "name email");

  if (!workout) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  res.json({ workout });
});

export const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findById(req.params.id);

  if (!workout) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  const allowedFields = ["name", "description", "goal", "exercises", "level", "daysPerWeek"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      workout[field] = req.body[field];
    }
  });

  await workout.save();

  res.json({
    message: "Workout plan updated successfully.",
    workout
  });
});

export const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findById(req.params.id);

  if (!workout) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  await workout.deleteOne();
  await User.updateMany({}, { $pull: { assignedWorkoutPlans: workout._id } });

  res.json({ message: "Workout plan deleted successfully." });
});

export const assignWorkoutToUser = asyncHandler(async (req, res) => {
  const { userId, workoutId } = req.body;

  if (!userId || !workoutId) {
    res.status(400);
    throw new Error("userId and workoutId are required.");
  }

  const user = await User.findById(userId);
  const workout = await WorkoutPlan.findById(workoutId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (!workout) {
    res.status(404);
    throw new Error("Workout plan not found.");
  }

  const alreadyAssigned = user.assignedWorkoutPlans.some(
    (assignedId) => assignedId.toString() === workoutId
  );

  if (!alreadyAssigned) {
    user.assignedWorkoutPlans.push(workout._id);
    await user.save();
    await createNotification({
      userId: user._id,
      message: `A new workout plan has been assigned to you: ${workout.name}.`,
      type: "workout"
    });
  }

  const updatedUser = await User.findById(userId)
    .select("-password")
    .populate("assignedWorkoutPlans");

  res.json({
    message: "Workout assigned successfully.",
    user: updatedUser
  });
});

export const getMyWorkouts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("assignedWorkoutPlans")
    .populate("assignedWorkoutPlans");

  res.json({
    workouts: user?.assignedWorkoutPlans || []
  });
});

// Backward-compatible exports for older app code.
export const getWorkoutPlans = getAllWorkouts;
export const assignPlansToUser = asyncHandler(async (req, res) => {
  const { userId, workoutId, workoutPlanIds = [] } = req.body;

  // Support the new API contract on the same legacy route.
  if (workoutId) {
    req.body = { userId, workoutId };
    return assignWorkoutToUser(req, res);
  }

  if (!userId) {
    res.status(400);
    throw new Error("userId is required.");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.assignedWorkoutPlans = workoutPlanIds;
  await user.save();

  await Promise.all(
    workoutPlanIds.map((workoutPlanId) =>
      createNotification({
        userId,
        message: `A workout plan has been assigned to your account.`,
        type: "workout"
      })
    )
  );

  const updatedUser = await User.findById(userId)
    .select("-password")
    .populate("assignedWorkoutPlans");

  res.json({
    message: "Workout plans assigned successfully.",
    user: updatedUser
  });
});
