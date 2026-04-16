import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    details: { type: String, required: true }
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: String, required: true },
    calories: { type: Number, required: true },
    meals: [mealSchema]
  },
  { timestamps: true }
);

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

export default DietPlan;
