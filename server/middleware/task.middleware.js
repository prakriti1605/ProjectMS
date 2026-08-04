import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import Organisation from "../models/organisation.model.js";


export const checkTaskAccess = async (req, res, next) => {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    // 🔴 IMPORTANT SECURITY CHECK
    if (project._id.toString() !== req.params.projectId) {
        return res.status(403).json({
            message: "Task does not belong to this project"
        });
    }

    const org = await Organisation.findById(project.organisation);

    const member = org.members.find(m =>
        m.user.equals(req.user._id)
    );

    if (!member) {
        return res.status(403).json({ message: "Not a member" });
    }

    req.task = task;
    req.project = project;
    req.org = org;
    req.member = member;

    if (
  member.role === "member" &&
  !member.permissions.includes("task:updateStatus")
) {
  member.permissions.push("task:updateStatus");
}

    next();
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

    const org = await Organisation.findById(project.organisation);

    if (!org) {
      return res.status(404).json({
        message: "Organisation not found",
      });
    }

    const member = org.members.find((m) =>
      m.user.equals(req.user._id)
    );

    if (!member) {
      return res.status(403).json({
        message: "Not a member of this organisation",
      });
    }

    req.task = task;
    req.project = project;
    req.org = org;
    req.member = member;

    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};