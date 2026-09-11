import React from "react";
import { Calendar, Clock, Edit3, CheckCircle2 } from "lucide-react";
import { formatDate, calculateDuration } from "../../../utils/dateUtils";

export default function ProjectTimelineHeader({ project, onOpenEditModal }) {
  const totalProjectDays = calculateDuration(project?.startDate, project?.endDate);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Project Timeline</h2>
            {/* White text badge as requested */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              On Track
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Master project lifecycle parameters and high-level milestones.
          </p>
        </div>

        <button
          onClick={onOpenEditModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
        >
          <Edit3 className="w-4 h-4 text-orange-400" />
          Edit Master Timeline
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800/60 rounded-lg text-orange-400 border border-slate-700/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Start Date</p>
            <p className="text-base font-semibold text-white mt-0.5">{formatDate(project?.startDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800/60 rounded-lg text-orange-400 border border-slate-700/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Target Completion</p>
            <p className="text-base font-semibold text-white mt-0.5">{formatDate(project?.endDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800/60 rounded-lg text-orange-400 border border-slate-700/50">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Duration</p>
            <p className="text-base font-semibold text-white mt-0.5">
              {totalProjectDays > 0 ? `${totalProjectDays} Days` : "Not Set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}