import bcrypt from "bcryptjs";
import DietPlan from "../models/DietPlan.js";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

const workoutPlans = [
  {
    name: "Lean Starter Split",
    description: "A beginner-friendly 3-day plan that builds consistency and movement quality.",
    level: "Beginner",
    goal: "Weight Loss",
    daysPerWeek: 3,
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: 12, details: "Use a moderate pace and full range of motion." },
      { name: "Push-Up", sets: 3, reps: 10, details: "Elevate hands if needed to keep technique solid." },
      { name: "Walking Lunge", sets: 3, reps: 12, details: "Count reps per leg." }
    ]
  },
  {
    name: "Mass Builder Blueprint",
    description: "A 5-day hypertrophy split focused on compound lifts and volume progression.",
    level: "Intermediate",
    goal: "Muscle Gain",
    daysPerWeek: 5,
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: 8, details: "Rest 2 minutes between sets." },
      { name: "Bench Press", sets: 4, reps: 8, details: "Add weight when all reps feel controlled." },
      { name: "Romanian Deadlift", sets: 4, reps: 10, details: "Keep tension in hamstrings." }
    ]
  },
  {
    name: "Balanced Performance Plan",
    description: "A sustainable weekly program that blends strength, conditioning, and mobility.",
    level: "All Levels",
    goal: "Maintenance",
    daysPerWeek: 4,
    exercises: [
      { name: "Trap Bar Deadlift", sets: 4, reps: 6, details: "Drive through the floor and keep your chest tall." },
      { name: "Dumbbell Row", sets: 3, reps: 12, details: "Pause at the top of each rep." },
      { name: "Bike Intervals", sets: 6, reps: 1, details: "One-minute hard effort, one-minute easy recovery." }
    ]
  }
];

const dietPlans = [
  {
    title: "Calorie Deficit Fuel Plan",
    description: "High-protein meals designed to support fat loss while preserving energy.",
    goal: "Weight Loss",
    calories: 1900,
    meals: [
      { label: "Breakfast", details: "Veggie omelet with oats and berries." },
      { label: "Lunch", details: "Grilled chicken, quinoa, and roasted vegetables." },
      { label: "Dinner", details: "Baked salmon with salad and sweet potato." }
    ]
  },
  {
    title: "Muscle Gain Nutrition Plan",
    description: "Protein-rich meals with quality carbs to support training and recovery.",
    goal: "Muscle Gain",
    calories: 2800,
    meals: [
      { label: "Breakfast", details: "Egg scramble, toast, banana, and yogurt." },
      { label: "Lunch", details: "Lean beef rice bowl with avocado and greens." },
      { label: "Dinner", details: "Chicken pasta with olive oil and parmesan." }
    ]
  },
  {
    title: "Maintenance Balance Menu",
    description: "Steady energy and practical meals for long-term healthy routines.",
    goal: "Maintenance",
    calories: 2300,
    meals: [
      { label: "Breakfast", details: "Greek yogurt bowl with fruit and nuts." },
      { label: "Lunch", details: "Turkey wrap with hummus and side salad." },
      { label: "Dinner", details: "Tofu stir-fry with rice and mixed vegetables." }
    ]
  }
];

const seedInitialData = async () => {
  let adminUser = await User.findOne({ email: "admin@primephysique.com" });

  if (!adminUser) {
    // Seed one admin account so the dashboard is usable immediately.
    const password = await bcrypt.hash("Admin123!", 10);

    adminUser = await User.create({
      name: "Prime Admin",
      email: "admin@primephysique.com",
      password,
      age: 30,
      height: 178,
      weight: 78,
      goal: "General Fitness",
      isAdmin: true
    });
  }

  if (!(await WorkoutPlan.countDocuments())) {
    const workoutsWithCreator = workoutPlans.map((plan) => ({
      ...plan,
      createdBy: adminUser._id
    }));

    await WorkoutPlan.insertMany(workoutsWithCreator);
  }

  if (!(await DietPlan.countDocuments())) {
    await DietPlan.insertMany(dietPlans);
  }
};

export default seedInitialData;
