import Notification from "../models/Notification.js";

const allowedTypes = ["expiry", "payment", "general"];

export const createNotification = async ({ userId, title, message, type = "general" }) => {
  if (!userId || !message) {
    return null;
  }

  return Notification.create({
    userId,
    title: title || "PrimePhysique Update",
    message,
    type: allowedTypes.includes(type) ? type : "general"
  });
};
