import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    organisation: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        // Organisation
        "ORG_CREATED",
        "ORG_UPDATED",
        "ORG_DELETED",
        "MEMBER_JOINED",
        "MEMBER_REMOVED",
        "MEMBER_ROLE_CHANGED",
        "MEMBER_PERMISSIONS_CHANGED",
        "JOIN_CODE_GENERATED",

        // Project
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",

        // Task
        "TASK_CREATED",
        "TASK_UPDATED",
        "TASK_DELETED",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_PRIORITY_CHANGED",
        "TASK_DUE_DATE_CHANGED",
      ],
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
activitySchema.index({ organisation: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);