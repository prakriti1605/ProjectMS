// controllers/task.controller.js
import Task from "../models/task.model.js";
import mongoose from "mongoose";
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;
    console.log(req.org.members);
    // 1. Validate assignedTo format (if provided)
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    // 2. Validate member belongs to org
    if (assignedTo) {
      const isMember = req.org.members.some(
        (m) => m.user?.toString() === assignedTo.toString()
      );

      if (!isMember) {
        return res.status(400).json({
          message: "User is not a member of this organisation",
        });
      }
    }

    // 3. Create task
    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo: assignedTo || undefined,
      project: req.project._id,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Task created",
      task,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
export const getTasksByProject = async (req, res) => {
  const { status, priority, assignedTo } = req.query;

  const filter = {
    project: req.project._id,
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  return res.json({ tasks });
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
  .populate("assignedTo", "name email")
  .populate("createdBy", "name email");

return res.json({ task });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { task } = req; // coming from middleware
    const { title, description, status, priority, assignedTo } = req.body;

    // 1. Validate assignedTo format (if provided)
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    // 2. Check if assigned user belongs to org
    if (assignedTo) {
      const isMember = req.org.members.some(
        (m) => m.user.toString() === assignedTo.toString()
      );

      if (!isMember) {
        return res.status(400).json({
          message: "User is not a member of this organisation",
        });
      }

      task.assignedTo = assignedTo;
    }

    // 3. Update fields only if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;

    // 4. Save
    await task.save();

    return res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteTask = async (req, res) => {
    await Task.findByIdAndDelete(req.params.taskId);

    return res.json({
        message: "Task deleted"
    });
};