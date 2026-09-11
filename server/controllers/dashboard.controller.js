import Organisation from "../models/organisation.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.org._id;

    const projectsCount = await Project.countDocuments({
      organisation: orgId,
    });


    const membersCount = req.org.members.length;


    const projects = await Project.find({
      organisation: orgId,
    }).select("_id");


    const projectIds = projects.map(
      (project) => project._id
    );


    const tasksCount = await Task.countDocuments({
      project: { $in: projectIds },
    });


    return res.json({
      projects: projectsCount,
      members: membersCount,
      tasks: tasksCount,
    });


  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};