
import Project from "../models/project.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      organisation: req.org._id,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Project created",
      project,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
  organisation: req.org._id,
}).populate("createdBy", "name email");

return res.json({ projects });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.projectId)
  .populate("createdBy", "name email");

return res.json({ project });
};

export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;

    await req.project.save();

    res.json({
      message: "Project updated successfully",
      project: req.project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await req.project.deleteOne();

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};