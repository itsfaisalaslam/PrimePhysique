import mongoose from "mongoose";

const connectDB = async () => {
  // Stop early with a clear message if the Atlas/local MongoDB URI is missing.
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
  }

  try {
    // Connect using the URI from the environment file.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // Re-throw so server startup can decide how to handle the failure.
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;
