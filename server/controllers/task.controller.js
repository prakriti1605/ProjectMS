// controllers/task.controller.js
import Task from "../models/task.model.js";
import mongoose from "mongoose";
import { logActivity } from "../utils/actvityLogger.js";
import OrganisationMember from "../models/organisationMember.model.js";


export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, phase, assignedTo, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Direct check: agar phase empty string "" hai ya invalid, to null rakho
    const resolvedPhase = phase && phase !== "" ? phase : null;
    const resolvedAssignee = assignedTo && assignedTo !== "" ? assignedTo : null;

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      priority: priority ? priority.toLowerCase() : "medium",
      status: status ? status.toLowerCase() : "todo",
      phase: resolvedPhase,
      project: req.params.projectId,
      organisation: req.org._id,
      assignedTo: resolvedAssignee,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;

    const filter = {
      project: req.project._id,
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return res.json({ tasks });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
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
    const { task } = req;

    // Body se fields extract karo
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      phase,
      phaseId,
    } = req.body;

    // Activity log ke liye purana state save karo
    const oldTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?.toString(),
      dueDate: task.dueDate,
      phase: task.phase?.toString(),
    };

    // 1. Title
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      task.title = title.trim();
    }

    // 2. Description
    if (description !== undefined) {
      task.description = description;
    }

    // 3. Status
    if (status !== undefined) {
      task.status = status;
    }

    // 4. Priority
    if (priority !== undefined) {
      task.priority = priority;
    }

    // 5. Phase (Handles both "phase" or "phaseId" from frontend)
    const targetPhase = phase !== undefined ? phase : phaseId;
    if (targetPhase !== undefined) {
      if (targetPhase === null || targetPhase === "") {
        task.phase = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetPhase)) {
          return res.status(400).json({ message: "Invalid phase ID." });
        }
        task.phase = targetPhase;
      }
    }

    // 6. Assignee
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        task.assignedTo = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ message: "Invalid user ID." });
        }

        const isMember = await OrganisationMember.exists({
          organisation: req.org._id,
          user: assignedTo,
        });

        if (!isMember) {
          return res.status(400).json({
            message: "User is not a member of this organisation.",
          });
        }

        task.assignedTo = assignedTo;
      }
    }

    // 7. Due Date
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        task.dueDate = undefined;
      } else {
        const parsedDate = new Date(dueDate);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid due date." });
        }
        task.dueDate = parsedDate;
      }
    }

    // Changes save karo
    await task.save();

    // ==========================================
    // ACTIVITY LOGGING
    // ==========================================
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

    const newPhaseStr = task.phase?.toString();
    if (oldTask.phase !== newPhaseStr) {
      changes.push(newPhaseStr ? "moved to a new phase" : "removed from phase");
    }

    const newAssignedTo = task.assignedTo?.toString();
    if (oldTask.assignedTo !== newAssignedTo) {
      changes.push(newAssignedTo ? "assigned member changed" : "task unassigned");
    }

    const oldDueDate = oldTask.dueDate
      ? new Date(oldTask.dueDate).toISOString().split("T")[0]
      : undefined;
    const newDueDate = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : undefined;

    if (oldDueDate !== newDueDate) {
      changes.push(newDueDate ? "due date changed" : "due date removed");
    }

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
    console.error("UPDATE TASK ERROR:", err);
    return res.status(500).json({
      message: err.message || "Server error while updating task",
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
      assignedTo: req.user._id,
    })
    .populate("project", "name");

    tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return res.status(200).json({
      tasks
    });

  } catch(error){
    return res.status(500).json({
      message:error.message
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    console.log({
  task: !!req.task,
  project: !!req.project,
  org: !!req.org,
  member: !!req.member,
  user: !!req.user,
});
    const { task } = req;
    const { status } = req.body;

    const oldStatus = task.status;

    task.status = status;
    await task.save();

    if (oldStatus !== status) {
      await logActivity({
        organisation: req.org._id,
        project: task.project,
        actor: req.user._id,
        action: "TASK_UPDATED",
        message: `${req.user.username} changed task "${task.title}" status from "${oldStatus}" to "${status}"`,
      });
    }

    return res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
       stack: err.stack, // remove after debugging
    });
  }
};