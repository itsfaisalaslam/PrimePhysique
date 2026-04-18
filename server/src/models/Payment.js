import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    membershipPlan: {
      type: String,
      required: true
    },
    totalFee: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0
    },
    pendingAmount: {
      type: Number,
      required: true,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid"
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank", "other"],
      default: "cash"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
