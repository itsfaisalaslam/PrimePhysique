import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Create a JWT token that stays valid for 7 days.
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  height: user.height,
  weight: user.weight,
  goal: user.goal,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, age, height, weight, goal, isAdmin } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists.");
  }

  // Hash the password with a salt round of 10 before saving.
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    age,
    height,
    weight,
    goal,
    isAdmin
  });

  res.status(201).json({
    message: "User created successfully.",
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error("JWT_SECRET is not configured.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json({
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
});
