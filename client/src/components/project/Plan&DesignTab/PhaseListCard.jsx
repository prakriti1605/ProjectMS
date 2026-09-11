import React from "react";
import { ChevronRight, Edit3, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate, calculateDuration } from "../../../utils/dateUtils";

export default function PhaseListCard({ phase, tasks = [], onEdit, onDelete }) {
  // 1. Filter tasks belonging to this phase (handles populated objects or ID strings)
  const phaseTasks = tasks.filter((t) => {
    const taskPhaseId = t.phase?._id || t.phaseId || t.phase;
    return String(taskPhaseId) === String(phase._id);
  });

  const totalTasks = phaseTasks.length;

  // 2. Count completed tasks (case-insensitive check for "completed" or "done")
  const completedCount = phaseTasks.filter((t) => {
    const status = t.status?.toLowerCase();
    return status === "completed" || status === "done";
  }).length;

  const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  // 3. Derived Completion Status (Auto-detects when all tasks in phase are finished)
  const isAllTasksCompleted = totalTasks > 0 && completedCount === totalTasks;
  const isPhaseCompleted = phase.status?.toLowerCase() === "completed" || isAllTasksCompleted;

  // 4. Overdue Calculation (Compare target end date vs current date)
  const today = new Date();
  const endDate = phase.endDate ? new Date(phase.endDate) : null;
  const isPastDeadline = endDate && endDate < today;

  let overdueDays = 0;
  if (isPastDeadline && !isPhaseCompleted) {
    const diffTime = Math.abs(today - endDate);
    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        overdueDays > 0
          ? "border-red-500/40 bg-red-950/10 hover:border-red-500/60"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Left Info Section */}
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-base font-semibold text-white">{phase.name}</h4>

          {/* Status Badge Logic */}
          {isPhaseCompleted ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          ) : overdueDays > 0 ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3 h-3" />
              Overdue by {overdueDays} day{overdueDays > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {phase.status || "Scheduled"}
            </span>
          )}
        </div>

        {/* Date Timeline */}
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <span>{formatDate(phase.startDate)}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className={overdueDays > 0 ? "text-red-400 font-medium" : ""}>
            {formatDate(phase.endDate)}
          </span>
          <span className="text-slate-600">•</span>
          <span>{calculateDuration(phase.startDate, phase.endDate)} Days</span>
        </p>

        {phase.description && (
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{phase.description}</p>
        )}
      </div>

      {/* Task Completion Progress Section */}
      <div className="w-full md:w-56 space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-400">Task Completion</span>
          <span
            className={
              isPhaseCompleted
                ? "text-emerald-400 font-bold"
                : overdueDays > 0
                ? "text-red-400 font-bold"
                : "text-orange-400"
            }
          >
            {completedCount}/{totalTasks} Tasks ({progress}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isPhaseCompleted
                ? "bg-emerald-500"
                : overdueDays > 0
                ? "bg-red-500"
                : "bg-orange-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
        <button
          onClick={() => onEdit(phase)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          title="Edit Phase"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(phase)}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          title="Delete Phase"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}