export const requirePermission = (permission) => {
  return (req, res, next) => {

    console.log("Required Permission:", permission);
    console.log("User Permissions:", req.member.permissions);

    const allowed = req.member.permissions.includes(permission);

    console.log("Allowed:", allowed);

    if (!allowed) {
      return res.status(403).json({
        message: "You do not have permission to perform this action."
      });
    }
    console.log("Permission granted");
    next();
  };
};
export const authorizeTaskUpdate = (req, res, next) => {
  const { task, member, user } = req;

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  // Completed tasks are immutable.
  if (task.status === "done") {
    return res.status(403).json({
      message: "Completed tasks cannot be updated.",
    });
  }

  const permissions = member.permissions || [];
  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    return res.status(400).json({
      message: "No fields provided for update.",
    });
  }

  // Members can ONLY update status of tasks assigned to themselves.
  if (member.role === "member") {
    const isAssignedToUser =
      task.assignedTo &&
      task.assignedTo.toString() === user._id.toString();

    if (
      permissions.includes("task:updateStatus") &&
      isAssignedToUser &&
      updates.length === 1 &&
      updates[0] === "status"
    ) {
      return next();
    }

    return res.status(403).json({
      message: "You can only update the status of tasks assigned to you.",
    });
  }

  // Admin / Owner permissions.
  const fieldPermissions = {
    title: "task:updateDetails",
    description: "task:updateDetails",
    priority: "task:updateDetails",
    status: "task:updateStatus",
    assignedTo: "task:updateAssignee",
    dueDate: "task:updateDueDate",
  };

  for (const field of updates) {
    const requiredPermission = fieldPermissions[field];

    if (!requiredPermission) {
      return res.status(403).json({
        message: `You cannot update "${field}".`,
      });
    }

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: `You do not have permission to update "${field}".`,
      });
    }
  }

  next();
};