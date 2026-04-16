import WorkoutPlan from "../models/WorkoutPlan.js";
import asyncHandler from "../middleware/asyncHandler.js";

const goalLabels = {
  "muscle gain": "Muscle Gain",
  "fat loss": "Fat Loss",
  maintenance: "Maintenance"
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};

const exerciseLibrary = {
  "muscle gain": {
    beginner: [
      { name: "Goblet Squat", sets: 3, reps: 10 },
      { name: "Push-Up", sets: 3, reps: 10 },
      { name: "Dumbbell Row", sets: 3, reps: 12 },
      { name: "Romanian Deadlift", sets: 3, reps: 10 },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
      { name: "Walking Lunge", sets: 3, reps: 12 }
    ],
    intermediate: [
      { name: "Barbell Back Squat", sets: 4, reps: 8 },
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Bent-Over Row", sets: 4, reps: 10 },
      { name: "Romanian Deadlift", sets: 4, reps: 8 },
      { name: "Overhead Press", sets: 4, reps: 8 },
      { name: "Pull-Up", sets: 4, reps: 8 }
    ],
    advanced: [
      { name: "Front Squat", sets: 5, reps: 6 },
      { name: "Incline Bench Press", sets: 5, reps: 6 },
      { name: "Weighted Pull-Up", sets: 5, reps: 6 },
      { name: "Deadlift", sets: 5, reps: 5 },
      { name: "Bulgarian Split Squat", sets: 4, reps: 8 },
      { name: "Seated Dumbbell Press", sets: 4, reps: 8 }
    ]
  },
  "fat loss": {
    beginner: [
      { name: "Bodyweight Squat", sets: 3, reps: 15 },
      { name: "Incline Push-Up", sets: 3, reps: 12 },
      { name: "Step-Up", sets: 3, reps: 12 },
      { name: "Mountain Climber", sets: 3, reps: 20 },
      { name: "Glute Bridge", sets: 3, reps: 15 },
      { name: "Plank", sets: 3, reps: 30 }
    ],
    intermediate: [
      { name: "Kettlebell Swing", sets: 4, reps: 15 },
      { name: "Thruster", sets: 4, reps: 12 },
      { name: "Renegade Row", sets: 4, reps: 10 },
      { name: "Reverse Lunge", sets: 4, reps: 12 },
      { name: "Burpee", sets: 4, reps: 10 },
      { name: "Plank Shoulder Tap", sets: 4, reps: 20 }
    ],
    advanced: [
      { name: "Barbell Complex", sets: 5, reps: 8 },
      { name: "Box Jump", sets: 5, reps: 10 },
      { name: "Battle Rope Slam", sets: 5, reps: 20 },
      { name: "Walking Lunge", sets: 5, reps: 16 },
      { name: "Burpee Broad Jump", sets: 5, reps: 8 },
      { name: "Hanging Knee Raise", sets: 5, reps: 15 }
    ]
  },
  maintenance: {
    beginner: [
      { name: "Goblet Squat", sets: 3, reps: 12 },
      { name: "Push-Up", sets: 3, reps: 10 },
      { name: "Single-Arm Row", sets: 3, reps: 12 },
      { name: "Hip Hinge", sets: 3, reps: 12 },
      { name: "Farmer Carry", sets: 3, reps: 30 },
      { name: "Dead Bug", sets: 3, reps: 12 }
    ],
    intermediate: [
      { name: "Trap Bar Deadlift", sets: 4, reps: 6 },
      { name: "Dumbbell Bench Press", sets: 4, reps: 10 },
      { name: "Lat Pulldown", sets: 4, reps: 10 },
      { name: "Split Squat", sets: 4, reps: 10 },
      { name: "Cable Face Pull", sets: 4, reps: 12 },
      { name: "Bike Intervals", sets: 4, reps: 5 }
    ],
    advanced: [
      { name: "Deadlift", sets: 4, reps: 5 },
      { name: "Push Press", sets: 4, reps: 6 },
      { name: "Weighted Chin-Up", sets: 4, reps: 6 },
      { name: "Rear Foot Elevated Split Squat", sets: 4, reps: 8 },
      { name: "Chest Supported Row", sets: 4, reps: 10 },
      { name: "Sled Push", sets: 4, reps: 20 }
    ]
  }
};

const normalizeGoal = (goal = "") => {
  const normalized = goal.toLowerCase().trim();

  if (normalized === "weight loss") {
    return "fat loss";
  }

  return normalized;
};

const normalizeLevel = (level = "") => level.toLowerCase().trim();

const buildFallbackWorkout = ({ goal, experienceLevel, daysPerWeek }) => {
  const normalizedGoal = normalizeGoal(goal);
  const normalizedLevel = normalizeLevel(experienceLevel);
  const safeGoal = exerciseLibrary[normalizedGoal] ? normalizedGoal : "maintenance";
  const safeLevel = exerciseLibrary[safeGoal][normalizedLevel] ? normalizedLevel : "beginner";
  const baseExercises = exerciseLibrary[safeGoal][safeLevel];
  const exerciseCount = Math.min(Math.max(Number(daysPerWeek) + 2, 4), baseExercises.length);

  return {
    name: `${goalLabels[safeGoal]} ${levelLabels[safeLevel]} AI Plan`,
    description: `A ${daysPerWeek}-day ${goalLabels[safeGoal].toLowerCase()} routine for ${safeLevel} trainees.`,
    goal: goalLabels[safeGoal],
    level: levelLabels[safeLevel],
    daysPerWeek: Number(daysPerWeek),
    exercises: baseExercises.slice(0, exerciseCount)
  };
};

const tryGenerateWithOpenAI = async ({ goal, experienceLevel, daysPerWeek }) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `Generate a workout plan as JSON only.
Return an object with:
- name: string
- exercises: array of objects with name, sets, reps

Goal: ${goal}
Experience level: ${experienceLevel}
Days per week: ${daysPerWeek}

Keep the response concise and realistic.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a fitness coach. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content);

  return {
    name: parsed.name,
    exercises: (parsed.exercises || []).map((exercise) => ({
      name: exercise.name,
      sets: Number(exercise.sets) || 3,
      reps: Number(exercise.reps) || 10
    }))
  };
};

export const generateAIWorkout = asyncHandler(async (req, res) => {
  const { goal, experienceLevel, daysPerWeek } = req.body;

  if (!goal || !experienceLevel || !daysPerWeek) {
    res.status(400);
    throw new Error("goal, experienceLevel, and daysPerWeek are required.");
  }

  let workout;
  let source = "fallback";

  try {
    const aiWorkout = await tryGenerateWithOpenAI({ goal, experienceLevel, daysPerWeek });

    if (aiWorkout?.name && aiWorkout?.exercises?.length) {
      workout = {
        ...buildFallbackWorkout({ goal, experienceLevel, daysPerWeek }),
        ...aiWorkout
      };
      source = "openai";
    }
  } catch (error) {
    workout = null;
  }

  if (!workout) {
    workout = buildFallbackWorkout({ goal, experienceLevel, daysPerWeek });
  }

  res.json({
    source,
    workout: {
      name: workout.name,
      exercises: workout.exercises
    }
  });
});

export const saveGeneratedWorkout = asyncHandler(async (req, res) => {
  const { name, exercises, goal, experienceLevel, daysPerWeek } = req.body;

  if (!name || !Array.isArray(exercises) || exercises.length === 0) {
    res.status(400);
    throw new Error("A generated workout name and exercises are required.");
  }

  const workout = await WorkoutPlan.create({
    name,
    description: `AI-generated plan for ${experienceLevel || "all"} levels.`,
    goal: goal || "Maintenance",
    exercises: exercises.map((exercise) => ({
      name: exercise.name,
      sets: Number(exercise.sets) || 3,
      reps: Number(exercise.reps) || 10,
      details: "Generated by the AI workout builder."
    })),
    level: experienceLevel || "General",
    daysPerWeek: Number(daysPerWeek) || 3,
    createdBy: req.user._id
  });

  const alreadyAssigned = req.user.assignedWorkoutPlans.some(
    (assignedId) => assignedId.toString() === workout._id.toString()
  );

  if (!alreadyAssigned) {
    req.user.assignedWorkoutPlans.push(workout._id);
    await req.user.save();
  }

  res.status(201).json({
    message: "Generated workout saved successfully.",
    workout
  });
});
