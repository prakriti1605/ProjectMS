// controllers/task.controller.js
import Task from "../models/task.model.js";
import mongoose from "mongoose";
import { logActivity } from "../utils/actvityLogger.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      assignedTo,
      dueDate,
    } = req.body;

    // Validate assigned user ID
    if (
      assignedTo &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    // Check whether assigned user belongs to organisation
    if (assignedTo) {
      const isMember = req.org.members.some(
        (member) =>
          member.user.toString() === assignedTo.toString()
      );

      if (!isMember) {
        return res.status(400).json({
          message:
            "User is not a member of this organisation",
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      project: req.project._id,
      createdBy: req.user._id,
    });

    await logActivity({
    organisation: req.org._id,
    project: req.project._id,
    actor: req.user._id,
    action: "TASK_CREATED",
    message: `${req.user.username} created task "${task.title}"`,
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
    .populate("project","name")
    .populate("assignedTo", "username email")
    .populate("createdBy", "username email");

  return res.json({ tasks });
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
  .populate("assignedTo", "username email")
  .populate("createdBy", "username email");

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
    const { title, description, status, priority, assignedTo,dueDate } = req.body;
//old task so that when we log activity we can know what was changed. 
    const oldTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?.toString(),
      dueDate: task.dueDate,
    };

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
    if(dueDate) task.dueDate = dueDate;
    // 4. Save
    await task.save();

    //compare old tasks 
    const changes = [];

    if (oldTask.title !== task.title) {
      changes.push(`title changed to "${task.title}"`);
    }

    if (oldTask.description !== task.description) {
      changes.push("description updated");
    }

    if (oldTask.status !== task.status) {
      changes.push(`status changed to "${task.status}"`);
    }

    if (oldTask.priority !== task.priority) {
      changes.push(`priority changed to "${task.priority}"`);
    }

    const newAssignedTo = task.assignedTo?.toString();

    if (oldTask.assignedTo !== newAssignedTo) {
      changes.push("assigned member changed");
    }

    const oldDueDate = oldTask.dueDate
    ? new Date(oldTask.dueDate).toISOString().split("T")[0]
    : undefined;

  const newDueDate = task.dueDate
    ? new Date(task.dueDate).toISOString().split("T")[0]
    : undefined;

  if (oldDueDate !== newDueDate) {
    changes.push("due date changed");
  }

    // Create activity only if something actually changed
    if (changes.length > 0) {
      await logActivity({
        organisation: req.org._id,
        project: task.project,
        actor: req.user._id,
        action: "TASK_UPDATED",
        message: `${req.user.username} updated task "${task.title}": ${changes.join(", ")}`,
      });
    }

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
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await logActivity({
      organisation: req.org._id,
      project: task.project,
      actor: req.user._id,
      action: "TASK_DELETED",
      message: `${req.user.username} deleted task "${task.title}"`,
    });

    await task.deleteOne();

    return res.json({
      message: "Task deleted",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getMyTasks = async (req,res)=>{
  try{

    const tasks = await Task.find({
      assignedTo:req.user._id
    })
    .populate("project","name");
    return res.json({
      tasks
    });
  }catch(error){

    return res.status(500).json({
      message:error.message
    });

  }
};