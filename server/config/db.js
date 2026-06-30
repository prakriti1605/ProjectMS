import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.log("DB connection error:", error);
    process.exit(1);
  }
};