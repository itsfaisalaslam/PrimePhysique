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
    // The date the user first joined the platform.
    joinDate: {
      type: Date,
      default: Date.now
    },
    // The current membership plan selected for the user.
    membershipPlan: {
      type: String,
      enum: ["Basic", "Standard", "Premium", "None"],
      default: "None"
    },
    // The amount paid for the current membership plan.
    membershipFee: {
      type: Number,
      default: 0
    },
    // The date the current membership period starts.
    membershipStartDate: {
      type: Date,
      default: null
    },
    // The date the current membership period ends.
    membershipEndDate: {
      type: Date,
      default: null
    },
    // The current state of the user's membership.
    membershipStatus: {
      type: String,
      enum: ["active", "expired", "none"],
      default: "none"
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["admin", "trainer", "user"],
      default: "user"
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
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

userSchema.pre("save", function syncAdminRole(next) {
  if (this.isAdmin) {
    this.role = "admin";
  }

  if (this.role === "admin") {
    this.isAdmin = true;
  }

  if (this.role === "trainer" || this.role === "user") {
    this.isAdmin = false;
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
