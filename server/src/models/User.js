import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic authentication fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },

    // Optional profile fields
    age: {
      type: Number
    },
    height: {
      type: Number
    },
    weight: {
      type: Number
    },
    goal: {
      type: String,
      trim: true,
      alias: "fitnessGoal"
    },
    isAdmin: {
      type: Boolean,
      default: false
    },

    // These arrays support the broader PrimePhysique app.
    assignedWorkoutPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan" }],
    assignedDietPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "DietPlan" }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compatibility virtual so existing code can still read/write `role`.
userSchema.virtual("role")
  .get(function getRole() {
    return this.isAdmin ? "admin" : "user";
  })
  .set(function setRole(value) {
    this.isAdmin = value === "admin" || value === true;
  });

const User = mongoose.model("User", userSchema);

export default User;
