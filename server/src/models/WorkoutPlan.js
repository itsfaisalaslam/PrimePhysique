import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    details: { type: String, default: "" }
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    // Main workout information
    name: {
      type: String,
      required: [true, "Workout name is required"],
      trim: true,
      alias: "title"
    },
    description: {
      type: String,
      default: ""
    },
    goal: {
      type: String,
      default: ""
    },
    exercises: {
      type: [exerciseSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Optional legacy fields kept for compatibility with older PrimePhysique code.
    level: {
      type: String,
      default: "General"
    },
    daysPerWeek: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
