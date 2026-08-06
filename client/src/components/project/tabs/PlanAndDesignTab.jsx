import React, { useState } from "react";
import { Calendar, Layers, Clock, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function PlanAndDesignTab({
  project,
  phases = [],
  tasks = [],
  orgId,
  projectId,
  onRefresh,
}) {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'gantt'

  // Date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Status color helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "active":
      case "in progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "scheduled":
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E1E24] p-4 rounded-xl border border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Project Roadmap & Phases</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage project stages, timeline bounds, and milestone distributions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Switch */}
          <div className="flex bg-[#121212] p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewMode === "list"
                  ? "bg-[#2A2A32] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewMode === "gantt"
                  ? "bg-[#2A2A32] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Gantt View
            </button>
          </div>
        </div>
      </div>

      {/* Main View Container */}
      {phases.length === 0 ? (
        <div className="bg-[#1E1E24] border border-gray-800 rounded-xl p-12 text-center">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white">No Phases Configured</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            Break down this project into structured phases (e.g., Discovery, UI Design, MVP Execution) to track progress.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const phaseTasks = tasks.filter((t) => t.phase === phase._id);
            const completedTasks = phaseTasks.filter((t) => t.status === "done").length;
            const progressPct =
              phaseTasks.length > 0
                ? Math.round((completedTasks / phaseTasks.length) * 100)
                : 0;

            return (
              <div
                key={phase._id || index}
                className="bg-[#1E1E24] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20">
                      P{index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-white">{phase.name}</h3>
                      {phase.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{phase.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                        phase.status
                      )}`}
                    >
                      {phase.status || "Scheduled"}
                    </span>
                  </div>
                </div>

                {/* Phase Timeline & Progress Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>
                      Duration: <strong className="text-gray-200">{formatDate(phase.startDate)}</strong> –{" "}
                      <strong className="text-gray-200">{formatDate(phase.endDate)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>
                      Tasks: <strong className="text-gray-200">{completedTasks} / {phaseTasks.length} Done</strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-300 w-8 text-right">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GANTT VIEW (Visual Timeline) */
        <div className="bg-[#1E1E24] border border-gray-800 rounded-xl p-6 overflow-x-auto">
          <div className="min-w-[600px] space-y-6">
            <div className="border-b border-gray-800 pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
              <span>Phase Name</span>
              <span>Timeline Mapping</span>
            </div>

            {phases.map((phase, idx) => (
              <div key={phase._id || idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-white">{phase.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                  </span>
                </div>
                {/* Visual Gantt Bar */}
                <div className="w-full bg-[#121212] h-6 rounded-md p-1 border border-gray-800/80 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded text-[10px] text-white flex items-center justify-end pr-2 font-bold shadow-sm"
                    style={{ width: `${Math.max(25, (idx + 1) * 30)}%` }}
                  >
                    {phase.status || "Active"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}