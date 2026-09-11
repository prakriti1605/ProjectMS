import mongoose from "mongoose";

const organisation = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    joinCodeExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organisation", organisation);