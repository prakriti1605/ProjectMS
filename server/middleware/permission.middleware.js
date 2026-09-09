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
const TASK_FIELD_ALIASES = {
  phaseId: "phase",
};

const normaliseTaskValue = (field, value) => {
  if (value === undefined || value === null || value === "") return null;

  if (field === "dueDate") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().split("T")[0];
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  const stringValue = value.toString();

  return field === "status" || field === "priority"
    ? stringValue.toLowerCase()
    : stringValue;
};

const getChangedTaskFields = (task, body) =>
  Object.keys(body).filter((field) => {
    const taskField = TASK_FIELD_ALIASES[field] || field;

    return (
      normaliseTaskValue(taskField, task[taskField]) !==
      normaliseTaskValue(taskField, body[field])
    );
  });

export const authorizeTaskUpdate = (req, res, next) => {
  const { task, member, user } = req;

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const permissions = member?.permissions || [];
  const updates = Object.keys(req.body);

  if (updates.length === 0) {
    return res.status(400).json({
      message: "No fields provided for update.",
    });
  }

  const changedFields = getChangedTaskFields(task, req.body);

  // Nothing actually changes, so no permission is required
  if (changedFields.length === 0) {
    return next();
  }

  const statusChanged = changedFields.includes("status");

  // Completed tasks are immutable until they are moved out of "done"
  if (task.status?.toLowerCase() === "done" && !statusChanged) {
    return res.status(403).json({
      message: "Completed tasks cannot be updated.",
    });
  }

  const isMemberRole = member?.role === "member";
  const isAssignedToUser =
    task.assignedTo &&
    task.assignedTo.toString() === user._id.toString();

  // ========================================================
  // RULE 1: Review -> Done Transition Check (Admin/Owner Only)
  // ========================================================
  if (statusChanged) {
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
    const isOnlyStatusUpdate =
      changedFields.length === 1 && changedFields[0] === "status";
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

  for (const field of changedFields) {
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