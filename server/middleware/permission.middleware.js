export const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.member) {
        return res.status(403).json({ message: "Member context missing" });
      }

      // Owners always bypass individual permission checks
      if (req.member.role === "owner") {
        return next();
      }

      const hasPermission = req.member.permissions.includes(permission);

      if (!hasPermission) {
        return res.status(403).json({
          message: `Forbidden: You lack the required permission (${permission})`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
};
export const authorizeTaskUpdate = (req, res, next) => {
  try {
    const { task, member, user } = req;

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!member) {
      return res.status(403).json({
        message: "Member context missing",
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "User context missing",
      });
    }

    const updates = Object.keys(req.body || {});

    if (updates.length === 0) {
      return res.status(400).json({
        message: "No fields provided for update.",
      });
    }

    // ============================================================
    // DONE TASKS ARE IMMUTABLE
    // ============================================================

    if (task.status?.toLowerCase() === "done") {
      return res.status(403).json({
        message: "Completed tasks cannot be updated.",
      });
    }

    // ============================================================
    // OWNER
    // ============================================================

    if (member.role === "owner") {
      return next();
    }

    const permissions = member.permissions || [];

    // ============================================================
    // MEMBER
    // ============================================================

    if (member.role === "member") {
      const assignedUserId = task.assignedTo?._id || task.assignedTo;
      const authenticatedUserId = user._id || user.id;
      const isAssignedToUser =
        assignedUserId &&
        authenticatedUserId &&
        assignedUserId.toString() === authenticatedUserId.toString();

      if (!isAssignedToUser) {
        return res.status(403).json({
          message: "You can only update tasks assigned to you.",
        });
      }

      // Member can ONLY update status
      const isOnlyStatusUpdate =
        updates.length === 1 &&
        updates[0] === "status";

      if (!isOnlyStatusUpdate) {
        return res.status(403).json({
          message:
            "Members can only update the status of their assigned tasks.",
        });
      }

      // Member must have status permission
      if (!permissions.includes("task:updateStatus")) {
        return res.status(403).json({
          message:
            "You do not have permission to update task status.",
        });
      }

      // Member cannot move task to Done
      const newStatus = req.body.status?.toLowerCase();

      if (
        newStatus === "done" ||
        newStatus === "completed"
      ) {
        return res.status(403).json({
          message:
            "Only Admins and Owners can approve tasks to Done status.",
        });
      }

      return next();
    }

    // ============================================================
    // ADMIN
    // ============================================================

    if (member.role === "admin") {
      const fieldPermissions = {
        title: "task:updateDetails",
        description: "task:updateDetails",
        priority: "task:updateDetails",

        phase: "task:updateDetails",
        phaseId: "task:updateDetails",

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
            message:
              `You do not have permission to update "${field}".`,
          });
        }
      }

      return next();
    }

    // ============================================================
    // UNKNOWN ROLE
    // ============================================================

    return res.status(403).json({
      message: "You are not authorized to update this task.",
    });
  } catch (error) {
    console.error("AUTHORIZE TASK UPDATE ERROR:", error);

    return res.status(500).json({
      message: error.message || "Authorization error",
    });
  }
};