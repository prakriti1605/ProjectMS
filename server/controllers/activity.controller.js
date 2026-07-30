import Activity from "../models/activity.model.js";

export const getOrganisationActivities = async (req, res) => {
  try {
    const { orgId } = req.params;

    const activities = await Activity.find({
      organisation: orgId,
    })
      .populate("actor", "username email")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
};