import Notification from "../models/Notification.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({
    notifications
  });
});

export const createNotificationEntry = asyncHandler(async (req, res) => {
  const { userId, message, type } = req.body;
  const targetUserId = userId || req.user._id;

  if (!message || !type) {
    res.status(400);
    throw new Error("message and type are required.");
  }

  if (String(targetUserId) !== String(req.user._id) && !req.user.isAdmin) {
    res.status(403);
    throw new Error("You can only create notifications for yourself.");
  }

  const notification = await Notification.create({
    userId: targetUserId,
    message,
    type
  });

  res.status(201).json({
    message: "Notification created successfully.",
    notification
  });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    message: "Notification marked as read.",
    notification
  });
});
