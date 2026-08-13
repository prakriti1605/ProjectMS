// src/components/project/tabs/insights/insights.utils.js

export const calculateProjectInsights = (tasks = [], project = {}) => {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return {
      velocity: 0,
      completedCount: 0,
      inProgressCount: 0,
      scheduledCount: 0,
      overdueCount: 0,
      onTimeRate: 100,
      weeklyThroughput: 0,
    };
  }

  const completedCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;

  const inProgressCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "in progress" || t.status?.toLowerCase() === "in_progress"
  ).length;

  const scheduledCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "scheduled" || t.status?.toLowerCase() === "pending"
  ).length;

  const now = new Date();
  const overdueCount = tasks.filter((t) => {
    if (t.status?.toLowerCase() === "completed") return false;
    return t.dueDate && new Date(t.dueDate) < now;
  }).length;

  // Velocity %
  const velocity = Math.round((completedCount / totalTasks) * 100);

  // On-time completion rate
  const completedTasks = tasks.filter((t) => t.status?.toLowerCase() === "completed");
  const onTimeCount = completedTasks.filter((t) => {
    if (!t.dueDate) return true;
    const completedDate = new Date(t.updatedAt || t.completedAt);
    return completedDate <= new Date(t.dueDate);
  }).length;

  const onTimeRate = completedTasks.length > 0
    ? Math.round((onTimeCount / completedTasks.length) * 100)
    : 100;

  // Weekly Throughput
  const startDate = project?.startDate ? new Date(project.startDate) : new Date();
  const daysElapsed = Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
  const weeksElapsed = Math.max(1, daysElapsed / 7);
  const weeklyThroughput = (completedCount / weeksElapsed).toFixed(1);

  return {
    velocity,
    completedCount,
    inProgressCount,
    scheduledCount,
    overdueCount,
    onTimeRate,
    weeklyThroughput,
    totalTasks,
  };
};