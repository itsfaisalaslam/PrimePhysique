import Message from "../models/Message.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getChatHistory = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id }
    ]
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name email")
    .populate("receiver", "name email");

  res.json({
    messages
  });
});
