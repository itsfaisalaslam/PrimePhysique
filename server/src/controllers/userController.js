import Attendance from "../models/Attendance.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getUsersList = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("name email isAdmin")
    .sort({ name: 1 });

  res.json({
    users
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("assignedTrainer", "name email role");

  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  // Only allow editable profile fields.
  const fields = ["name", "age", "height", "weight", "goal"];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  const updatedUser = await User.findById(req.user._id).select("-password");
  res.json({
    message: "Profile updated successfully.",
    user: updatedUser
  });
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id }).sort({ paymentDate: -1, createdAt: -1 });

  res.json({ payments });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ userId: req.user._id }).sort({ date: -1, checkInTime: -1 });

  res.json({ attendance });
});

export const getMyAttendanceSummary = asyncHandler(async (req, res) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const nextMonthStart = new Date(monthStart);
  nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

  const [totalPresent, totalAbsent, lastCheckIn, currentMonthAttendanceCount] = await Promise.all([
    Attendance.countDocuments({ userId: req.user._id, status: "present" }),
    Attendance.countDocuments({ userId: req.user._id, status: "absent" }),
    Attendance.findOne({ userId: req.user._id, status: "present" }).sort({ checkInTime: -1 }),
    Attendance.countDocuments({
      userId: req.user._id,
      status: "present",
      date: {
        $gte: getStartOfDay(monthStart),
        $lt: nextMonthStart
      }
    })
  ]);

  res.json({
    summary: {
      totalPresent,
      totalAbsent,
      lastCheckIn,
      currentMonthAttendanceCount
    }
  });
});

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({ notifications });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  res.json({
    message: "Notification marked as read.",
    notification
  });
});

// Backward-compatible export for older parts of the app.
export const getCurrentUser = getProfile;
