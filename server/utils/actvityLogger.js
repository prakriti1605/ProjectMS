import Activity from "../models/activity.model.js";

export const logActivity = async ({
  organisation,
  project = null,
  task = null,
  actor,
  action,
  message,
  metadata = {},
}) => {
  try {
    await Activity.create({
      organisation,
      project,
      task,
      actor,
      action,
      message,
      metadata,
    });
  } catch (err) {
    console.error("Activity logging failed:", err.message);
  }
};