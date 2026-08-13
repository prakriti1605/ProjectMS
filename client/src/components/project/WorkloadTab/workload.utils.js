/**
 * Normalizes member data safely across different database schema shapes.
 */
export const normalizeMember = (member) => {
  if (!member) return null;
  const userObj = member.user && typeof member.user === "object" ? member.user : member;
  const userId = userObj._id || userObj.id || member._id || member.id;

  if (!userId) return null;

  return {
    userId: String(userId),
    username:
      userObj.username ||
      userObj.name ||
      (userObj.email ? userObj.email.split("@")[0] : null) ||
      "Team Member",
    email: userObj.email || member.email || "",
    role: member.role || userObj.role || "member",
  };
};

/**
 * Extracts assignee User ID from a task object.
 */
export const getTaskAssigneeId = (task) => {
  if (!task || !task.assignedTo) return null;
  if (typeof task.assignedTo === "object") {
    return String(task.assignedTo._id || task.assignedTo.id || "");
  }
  return String(task.assignedTo);
};

/**
 * Checks if a task is active (incomplete).
 */
export const isTaskActive = (task) => {
  const status = (task.status || "").toLowerCase();
  return status !== "completed" && status !== "done";
};

/**
 * Checks if a task is due within the next 7 days.
 */
export const isDueThisWeek = (task) => {
  if (!task.dueDate || !isTaskActive(task)) return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return due >= today && due <= nextWeek;
};

/**
 * Calculates dynamic capacity based on percentage share of total active project tasks.
 */
export const calculateCapacityStatus = (memberActiveCount, totalActiveProjectTasks) => {
  if (totalActiveProjectTasks === 0 || memberActiveCount === 0) {
    return {
      workloadPercentage: 0,
      capacityStatus: "available",
      recommendation: "Available for delegation",
      statusBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
  }

  const share = Math.round((memberActiveCount / totalActiveProjectTasks) * 100);

  if (share > 40) {
    return {
      workloadPercentage: share,
      capacityStatus: "overloaded",
      recommendation: `Carrying ${share}% of project load`,
      statusBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };
  } else if (share >= 15) {
    return {
      workloadPercentage: share,
      capacityStatus: "optimal",
      recommendation: `Balanced load (${share}% share)`,
      statusBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
  } else {
    return {
      workloadPercentage: share,
      capacityStatus: "available",
      recommendation: `Low share (${share}%) - Ready for tasks`,
      statusBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
  }
};