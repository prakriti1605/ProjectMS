/**
 * Groups tasks by phase, sorting phases by startDate and tasks by dueDate.
 */
export const groupAndSortTasksByPhase = (tasks = [], phases = []) => {
  // 1. Sort phases chronologically by startDate
  const sortedPhases = [...phases].sort((a, b) => {
    const dateA = a?.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b?.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  // 2. Helper to sort tasks chronologically by dueDate
  const sortTasks = (taskList) =>
    [...taskList].sort((a, b) => {
      const dateA = a?.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b?.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    });

  // 3. Map tasks under sorted phases
  const groupedPhases = sortedPhases.map((phase) => {
    const phaseTasks = tasks.filter((task) => {
      const taskPhaseId = typeof task.phase === "object" ? task.phase?._id : task.phase;
      return taskPhaseId === phase._id;
    });

    return {
      ...phase,
      tasks: sortTasks(phaseTasks),
    };
  });

  // 4. Collect tasks with no assigned phase ("Unassigned Phase")
  const unassignedTasks = tasks.filter((task) => !task.phase);

  return {
    groupedPhases,
    unassignedTasks: sortTasks(unassignedTasks),
  };
};