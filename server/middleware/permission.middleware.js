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
  const { task, member, user } = req;

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  // Completed tasks are immutable
  if (task.status?.toLowerCase() === "done" && req.body.status?.toLowerCase() === "done") {
    return res.status(403).json({
      message: "Completed tasks cannot be updated.",
    });
  }

  const permissions = member?.permissions || [];
  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    return res.status(400).json({
      message: "No fields provided for update.",
    });
  }

  const isMemberRole = member?.role === "member";
  const isAssignedToUser =
    task.assignedTo &&
    task.assignedTo.toString() === user._id.toString();

  // ========================================================
  // RULE 1: Review -> Done Transition Check (Admin/Owner Only)
  // ========================================================
  if (req.body.status) {
    const currentStatus = task.status?.toLowerCase();
    const newStatus = req.body.status?.toLowerCase();

    if (newStatus === "done" || newStatus === "completed") {
      if (isMemberRole) {
        return res.status(403).json({
          message: "Only Admins and Owners can approve tasks to Done status.",
        });
      }
    }
  }

  // ========================================================
  // RULE 2: Regular Member Permissions Check
  // ========================================================
  if (isMemberRole) {
    // Member can ONLY update status on tasks assigned to them
    if (!isAssignedToUser) {
      return res.status(403).json({
        message: "You can only update tasks assigned to you.",
      });
    }

    // Member can ONLY update status (no other fields like title, priority, assignee)
    const isOnlyStatusUpdate = updates.length === 1 && updates[0] === "status";
    const hasStatusPermission = permissions.includes("task:updateStatus");

    if (!isOnlyStatusUpdate || !hasStatusPermission) {
      return res.status(403).json({
        message: "Members can only update the status of their assigned tasks.",
      });
    }

    return next(); // Member status update authorized
  }

  // ========================================================
  // RULE 3: Admin / Owner Field Permission Check
  // ========================================================
  const fieldPermissions = {
    title: "task:updateDetails",
    description: "task:updateDetails",
    priority: "task:updateDetails",
    phase: "task:updateDetails",      // ✅ FIX: Added support for phase
    phaseId: "task:updateDetails",    // ✅ FIX: Added support for phaseId
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