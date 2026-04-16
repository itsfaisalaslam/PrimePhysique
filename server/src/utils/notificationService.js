import Notification from "../models/Notification.js";

export const createNotification = async ({ userId, message, type }) => {
  if (!userId || !message || !type) {
    return null;
  }

  return Notification.create({
    userId,
    message,
    type
  });
};
