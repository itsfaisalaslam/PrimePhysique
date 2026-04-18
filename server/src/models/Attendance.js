import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present"
    },
    checkInTime: {
      type: Date,
      default: Date.now
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

// One attendance record per user per normalized calendar day.
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
