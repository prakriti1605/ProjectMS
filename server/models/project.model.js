import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
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

    organisation: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);
projectSchema.index({ organisation: 1 });

export default mongoose.model("Project", projectSchema);