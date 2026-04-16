import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true },
    performanceScore: { type: Number, required: true, min: 1, max: 10 },
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
