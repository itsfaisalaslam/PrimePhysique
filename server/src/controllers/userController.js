import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getUsersList = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("name email isAdmin")
    .sort({ name: 1 });

  res.json({
    users
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  // `req.user` is attached by the protect middleware.
  res.json({ user: req.user });
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

// Backward-compatible export for older parts of the app.
export const getCurrentUser = getProfile;
