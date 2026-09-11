/**
 * Calculates phase progress percentage
 */
export const calculatePhaseProgress = (phaseTasks = []) => {
  if (!phaseTasks.length) return 0;
  const completed = phaseTasks.filter(
    (t) => t.status === "Done" || t.status === "Completed"
  ).length;
  return Math.round((completed / phaseTasks.length) * 100);
};

/**
 * Computes top KPI metrics from tasks array
 */
export const getKpiMetrics = (tasks = []) => {
  const now = new Date();

  const overdueOrAtRisk = tasks.filter((task) => {
    if (task.status === "Done" || task.status === "Completed") return false;
    const isOverdue = task.dueDate && new Date(task.dueDate) < now;
    const isHighRisk = task.priority === "High";
    return isOverdue || isHighRisk;
  });

  const needsApproval = tasks.filter((task) => task.status === "In Review");

  const unassigned = tasks.filter((task) => !task.assignedTo || !task.phaseId);

  return {
    overdueOrAtRisk,
    needsApproval,
    unassigned,
  };
};

/**
 * Groups tasks into phase containers and detects unscheduled/floating tasks
 */
export const groupTasksByPhase = (tasks = [], phases = []) => {
  const phaseMap = {};

  // Initialize phase containers with status
  phases.forEach((phase) => {
    phaseMap[phase._id] = {
      ...phase,
      status: phase.status || "Active", // Default to Active if status isn't set yet
      tasks: [],
    };
  });

  const unscheduledTasks = [];

  tasks.forEach((task) => {
    if (!task.phaseId || !phaseMap[task.phaseId]) {
      unscheduledTasks.push(task);
    } else {
      phaseMap[task.phaseId].tasks.push(task);
    }
  });

  return {
    groupedPhases: Object.values(phaseMap),
    unscheduledTasks,
  };
};