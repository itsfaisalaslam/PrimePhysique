import WorkoutLog from "../models/WorkoutLog.js";
import asyncHandler from "../middleware/asyncHandler.js";

const normalizeDate = (value) => {
  const inputDate = value ? new Date(value) : new Date();

  return new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate()));
};

const formatDateKey = (value) => normalizeDate(value).toISOString().slice(0, 10);

export const createWorkoutLog = asyncHandler(async (req, res) => {
  const { date, workoutId, completed = true } = req.body;
  const normalizedDate = normalizeDate(date);

  const workoutLog = await WorkoutLog.findOneAndUpdate(
    {
      userId: req.user._id,
      date: normalizedDate
    },
    {
      userId: req.user._id,
      date: normalizedDate,
      workoutId: workoutId || null,
      completed
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(201).json({
    message: "Workout logged successfully.",
    workoutLog
  });
});

export const getWorkoutLogs = asyncHandler(async (req, res) => {
  const workoutLogs = await WorkoutLog.find({ userId: req.user._id, completed: true })
    .populate("workoutId", "name goal")
    .sort({ date: 1 });

  res.json({
    workoutLogs
  });
});

export const getWorkoutStreak = asyncHandler(async (req, res) => {
  const workoutLogs = await WorkoutLog.find({ userId: req.user._id, completed: true }).sort({ date: -1 });
  const completedDates = new Set(workoutLogs.map((log) => formatDateKey(log.date)));

  let streak = 0;
  const today = normalizeDate(new Date());

  for (let offset = 0; ; offset += 1) {
    const currentDate = new Date(today);
    currentDate.setUTCDate(today.getUTCDate() - offset);
    const dateKey = currentDate.toISOString().slice(0, 10);

    if (!completedDates.has(dateKey)) {
      break;
    }

    streak += 1;
  }

  res.json({
    streak
  });
});
