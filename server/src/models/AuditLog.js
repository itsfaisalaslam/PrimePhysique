import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    targetType: {
      type: String,
      required: true,
      trim: true
    },
    targetId: {
      type: String,
      required: true,
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    details: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    updatedAt: false
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
