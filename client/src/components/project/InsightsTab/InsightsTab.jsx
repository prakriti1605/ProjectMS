import React, { useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX,
  Layers,
  BarChart3,
  Flame,
} from "lucide-react";

export default function InsightsTab({
  project,
  phases = [],
  tasks = [],
  members = [],
}) {
  const today = new Date();

  // 🔹 Dynamic Analytics Computation
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;

    // Normalize task status matching
    const completedTasks = tasks.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "completed" || s === "done";
    });

    const inProgressTasks = tasks.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "in progress" || s === "in_progress" || s === "active";
    });

    const scheduledTasks = tasks.filter((t) => {
      const s = t.status?.toLowerCase();
      return s === "scheduled" || s === "todo" || s === "pending";
    });

    // Overdue Tasks (Past due date & not completed)
    const overdueTasks = tasks.filter((t) => {
      const isDone =
        t.status?.toLowerCase() === "completed" ||
        t.status?.toLowerCase() === "done";
      if (isDone || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    });

    // Unassigned Tasks
    const unassignedTasks = tasks.filter(
      (t) => !t.assignedTo && !t.assignee
    );

    // High Priority Incomplete Tasks
    const criticalIncompleteTasks = tasks.filter((t) => {
      const isDone =
        t.status?.toLowerCase() === "completed" ||
        t.status?.toLowerCase() === "done";
      const priority = t.priority?.toLowerCase();
      return !isDone && (priority === "high" || priority === "urgent");
    });

    // Overall Progress %
    const overallProgress =
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Per-Phase Analytics Breakdown
    const phaseBreakdown = phases.map((phase) => {
      const phaseTasks = tasks.filter((t) => {
        const pId = t.phase?._id || t.phaseId || t.phase;
        return String(pId) === String(phase._id);
      });

      const phaseTotal = phaseTasks.length;
      const phaseCompleted = phaseTasks.filter((t) => {
        const s = t.status?.toLowerCase();
        return s === "completed" || s === "done";
      }).length;

      const phasePercent =
        phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

      return {
        _id: phase._id,
        name: phase.name || phase.title || "Unnamed Phase",
        total: phaseTotal,
        completed: phaseCompleted,
        percent: phasePercent,
      };
    });

    return {
      totalTasks,
      completedCount: completedTasks.length,
      inProgressCount: inProgressTasks.length,
      scheduledCount: scheduledTasks.length,
      overdueCount: overdueTasks.length,
      unassignedCount: unassignedTasks.length,
      criticalCount: criticalIncompleteTasks.length,
      overallProgress,
      phaseBreakdown,
      overdueTasks,
    };
  }, [tasks, phases]);

  return (
    <div className="space-y-6">
      {/* 🔹 Top Row Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Project Completion
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              {analytics.overallProgress}%
            </span>
            <span className="text-xs text-slate-400">
              {analytics.completedCount}/{analytics.totalTasks} Tasks
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Overdue Tasks Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Overdue Tasks
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                analytics.overdueCount > 0 ? "text-red-400" : "text-slate-500"
              }`}
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold ${
                analytics.overdueCount > 0 ? "text-red-400" : "text-white"
              }`}
            >
              {analytics.overdueCount}
            </span>
            <span className="text-xs text-slate-400">Needs Attention</span>
          </div>
          <p className="text-xs text-slate-500">
            {analytics.overdueCount > 0
              ? `${analytics.overdueCount} task(s) missed deadline`
              : "All active tasks on schedule"}
          </p>
        </div>

        {/* High Priority Risks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              High Priority Remaining
            </span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              {analytics.criticalCount}
            </span>
            <span className="text-xs text-slate-400">Critical Items</span>
          </div>
          <p className="text-xs text-slate-500">Urgent tasks still in pipeline</p>
        </div>

        {/* Unassigned Workload Guard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Unassigned Tasks
            </span>
            <UserX
              className={`w-4 h-4 ${
                analytics.unassignedCount > 0 ? "text-amber-400" : "text-slate-500"
              }`}
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold ${
                analytics.unassignedCount > 0 ? "text-amber-400" : "text-white"
              }`}
            >
              {analytics.unassignedCount}
            </span>
            <span className="text-xs text-slate-400">Floating Work</span>
          </div>
          <p className="text-xs text-slate-500">
            {analytics.unassignedCount > 0
              ? "Assign members to prevent delays"
              : "All tasks have assignees"}
          </p>
        </div>
      </div>

      {/* 🔹 Middle Row: Phase Progress & Task Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Progress Breakdown (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-semibold text-white">
              Phase Progress Breakdown
            </h3>
          </div>

          {analytics.phaseBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No phases configured for this project yet.
            </p>
          ) : (
            <div className="space-y-4">
              {analytics.phaseBreakdown.map((phase) => (
                <div key={phase._id} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-white">{phase.name}</span>
                    <span className="text-slate-400 text-xs">
                      {phase.completed}/{phase.total} Tasks ({phase.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        phase.percent === 100 ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${phase.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Status Distribution (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-semibold text-white">
              Status Distribution
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {/* Scheduled */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Scheduled / Todo</span>
              </div>
              <span className="font-bold text-white">
                {analytics.scheduledCount}
              </span>
            </div>

            {/* In Progress */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span>In Progress</span>
              </div>
              <span className="font-bold text-white">
                {analytics.inProgressCount}
              </span>
            </div>

            {/* Completed */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed</span>
              </div>
              <span className="font-bold text-emerald-400">
                {analytics.completedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Section: Immediate Overdue Action List */}
      {analytics.overdueTasks.length > 0 && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Action Items ({analytics.overdueTasks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analytics.overdueTasks.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-red-500/20 text-xs"
              >
                <span className="text-white font-medium line-clamp-1">
                  {t.title}
                </span>
                <span className="text-red-400 font-bold ml-2 shrink-0">
                  Due {new Date(t.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}