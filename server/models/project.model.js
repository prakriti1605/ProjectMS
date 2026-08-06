import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Phase name is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isMilestone: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "In Progress",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Archived"],
      default: "Active",
    },
    // Top-level Master Timeline dates
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    // Embedded Phase Schema
    phases: [phaseSchema],
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;