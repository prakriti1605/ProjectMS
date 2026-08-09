import React, { useMemo } from "react";
import { calculateProjectInsights } from "./insights.utils";

const InsightsTab = ({ tasks = [], project = {}, phases = [] }) => {
  const insights = useMemo(
    () => calculateProjectInsights(tasks, project),
    [tasks, project]
  );

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Dynamic Project Velocity */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Project Velocity
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
              Live
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-white">{insights.velocity}%</div>
            <span className="text-xs text-neutral-400">
              {insights.completedCount} of {insights.totalTasks} tasks
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${insights.velocity}%` }}
            />
          </div>
        </div>

        {/* Weekly Throughput */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Weekly Throughput
          </span>
          <div className="mt-3 text-3xl font-bold text-white">
            {insights.weeklyThroughput} <span className="text-sm font-normal text-neutral-400">tasks/wk</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Average completion rate per week
          </p>
        </div>

        {/* On-Time Delivery Rate */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            On-Time Completion
          </span>
          <div className="mt-3 text-3xl font-bold text-emerald-400">
            {insights.onTimeRate}%
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Tasks completed on or before due date
          </p>
        </div>

        {/* Overdue Alert */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Overdue Tasks
          </span>
          <div className={`mt-3 text-3xl font-bold ${insights.overdueCount > 0 ? "text-red-400" : "text-neutral-200"}`}>
            {insights.overdueCount}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {insights.overdueCount > 0 ? "Requires immediate attention" : "All tasks on schedule"}
          </p>
        </div>
      </div>

      {/* Phase Breakdown Section */}
      {phases.length > 0 && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Phase Progress Analysis
          </h3>
          <div className="space-y-4">
            {phases.map((phase) => {
              const phaseTasks = tasks.filter(
                (t) => (t.phase?._id || t.phase) === phase._id
              );
              const phaseTotal = phaseTasks.length;
              const phaseCompleted = phaseTasks.filter(
                (t) => t.status?.toLowerCase() === "completed"
              ).length;
              const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

              return (
                <div key={phase._id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-300">{phase.name}</span>
                    <span className="text-neutral-400">
                      {phaseCompleted}/{phaseTotal} tasks ({phaseProgress}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsTab;