import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import OrganisationMember from "../models/organisationMember.model.js"; // Import model


export const checkTaskAccess = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 💡 Query the OrganisationMember collection directly!
    const member = await OrganisationMember.findOne({
      organisation: project.organisation,
      user: req.user._id,
    });

    if (!member) {
      return res.status(403).json({ message: "Not a member of this organisation" });
    }

    req.task = task;
    req.project = project;
    req.member = member;

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const checkTaskStatusAccess = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // 💡 Query the OrganisationMember collection directly instead of org.members
    const member = await OrganisationMember.findOne({
      organisation: project.organisation,
      user: req.user._id,
    });

    if (!member) {
      return res.status(403).json({
        message: "Not a member of this organisation",
      });
    }

    req.task = task;
    req.project = project;
    req.member = member;

    next();
  } catch (err) {
    console.error("Error in checkTaskStatusAccess:", err);
    return res.status(500).json({
      message: err.message || "Server error checking status access",
    });
  }
};