import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);