import React from "react";
import { ChevronRight, Edit3, Trash2 } from "lucide-react";
import { formatDate, calculateDuration } from "../../../utils/dateUtils";

export default function PhaseListCard({ phase, tasks = [], onEdit, onDelete }) {
  const phaseTasks = tasks.filter((t) => t.phase === phase._id || t.phase?._id === phase._id);
  const completedCount = phaseTasks.filter((t) => t.status === "completed").length;
  const progress = phaseTasks.length === 0 ? 0 : Math.round((completedCount / phaseTasks.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-semibold text-white">{phase.name}</h4>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {phase.status || "Scheduled"}
          </span>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <span>{formatDate(phase.startDate)}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span>{formatDate(phase.endDate)}</span>
          <span className="text-slate-600">•</span>
          <span>{calculateDuration(phase.startDate, phase.endDate)} Days</span>
        </p>
        {phase.description && (
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{phase.description}</p>
        )}
      </div>

      <div className="w-full md:w-48 space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-400">Task Completion</span>
          <span className="text-orange-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-orange-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

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