import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      default: null
    },
    completed: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

workoutLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
