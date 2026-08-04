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

    // Completed tasks are completely immutable.
    if (task.status === "done") {
      return res.status(403).json({
        message: "Completed tasks cannot be updated.",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
    } = req.body;

    // Keep the original values for activity logging.
    const oldTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?.toString(),
      dueDate: task.dueDate,
    };

    // --------------------------------------------------
    // 1. Validate title
    // --------------------------------------------------
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty.",
        });
      }

      task.title = title.trim();
    }

    // --------------------------------------------------
    // 2. Description
    // --------------------------------------------------
    if (description !== undefined) {
      task.description = description;
    }

    // --------------------------------------------------
    // 3. Validate status using the schema enum
    // --------------------------------------------------
    if (status !== undefined) {
      const statusEnum =
        task.schema.path("status")?.enumValues || [];

      if (
        statusEnum.length > 0 &&
        !statusEnum.includes(status)
      ) {
        return res.status(400).json({
          message: `Invalid status. Allowed values: ${statusEnum.join(", ")}`,
        });
      }

      task.status = status;
    }

    // --------------------------------------------------
    // 4. Validate priority using the schema enum
    // --------------------------------------------------
    if (priority !== undefined) {
      const priorityEnum =
        task.schema.path("priority")?.enumValues || [];

      if (
        priorityEnum.length > 0 &&
        !priorityEnum.includes(priority)
      ) {
        return res.status(400).json({
          message: `Invalid priority. Allowed values: ${priorityEnum.join(", ")}`,
        });
      }

      task.priority = priority;
    }

    // --------------------------------------------------
    // 5. Assigned user
    //    null / "" means unassign
    // --------------------------------------------------
    if (assignedTo !== undefined) {
      if (
        assignedTo === null ||
        assignedTo === ""
      ) {
        task.assignedTo = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({
            message: "Invalid user id",
          });
        }

        const isMember = req.org.members.some(
          (m) =>
            m.user?.toString() === assignedTo.toString()
        );

        if (!isMember) {
          return res.status(400).json({
            message:
              "User is not a member of this organisation",
          });
        }

        task.assignedTo = assignedTo;
      }
    }

    // --------------------------------------------------
    // 6. Due date
    //    null / "" means remove due date
    // --------------------------------------------------
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        task.dueDate = undefined;
      } else {
        const parsedDate = new Date(dueDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            message: "Invalid due date.",
          });
        }

        task.dueDate = parsedDate;
      }
    }

    // --------------------------------------------------
    // 7. Save
    // --------------------------------------------------
    await task.save();

    // --------------------------------------------------
    // 8. Detect actual changes
    // --------------------------------------------------
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

    const newAssignedTo =
      task.assignedTo?.toString();

    if (oldTask.assignedTo !== newAssignedTo) {
      if (!newAssignedTo) {
        changes.push("task unassigned");
      } else {
        changes.push("assigned member changed");
      }
    }

    const oldDueDate = oldTask.dueDate
      ? new Date(oldTask.dueDate)
          .toISOString()
          .split("T")[0]
      : undefined;

    const newDueDate = task.dueDate
      ? new Date(task.dueDate)
          .toISOString()
          .split("T")[0]
      : undefined;

    if (oldDueDate !== newDueDate) {
      changes.push(
        newDueDate
          ? "due date changed"
          : "due date removed"
      );
    }

    // --------------------------------------------------
    // 9. Activity log
    // --------------------------------------------------
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