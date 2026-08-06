import React from "react";
import { 
  AlertTriangle, 
  Clock, 
  Inbox, 
  ArrowRight 
} from "lucide-react";

/**
 * TasksTriageBar - Displays top 3 KPI focus metrics and handles quick filtering.
 * 
 * Props:
 * - kpiMetrics: { overdueCount: number, needsApprovalCount: number, unassignedCount: number }
 * - activeFilter: string | null ('overdue' | 'needs_approval' | 'unassigned' | null)
 * - onSelectFilter: (filterKey: string | null) => void
 */
const TasksTriageBar = ({ kpiMetrics, activeFilter, onSelectFilter }) => {
  const { overdueCount = 0, needsApprovalCount = 0, unassignedCount = 0 } = kpiMetrics || {};

  const handleCardClick = (filterKey) => {
    // Toggle filter off if clicked twice
    if (activeFilter === filterKey) {
      onSelectFilter(null);
    } else {
      onSelectFilter(filterKey);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1. Overdue / At Risk Card */}
      <div
        onClick={() => handleCardClick("overdue")}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          activeFilter === "overdue"
            ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/10"
            : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400">Overdue / At Risk</p>
            <h4 className="text-xl font-bold text-neutral-100">{overdueCount} Tasks</h4>
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 transition-transform ${activeFilter === "overdue" ? "text-red-400 translate-x-1" : "text-neutral-500"}`} />
      </div>

      {/* 2. Needs Approval Card */}
      <div
        onClick={() => handleCardClick("needs_approval")}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          activeFilter === "needs_approval"
            ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
            : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400">Needs Approval</p>
            <h4 className="text-xl font-bold text-neutral-100">{needsApprovalCount} Task{needsApprovalCount !== 1 ? "s" : ""}</h4>
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 transition-transform ${activeFilter === "needs_approval" ? "text-amber-400 translate-x-1" : "text-neutral-500"}`} />
      </div>

      {/* 3. Unassigned Queue Card */}
      <div
        onClick={() => handleCardClick("unassigned")}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          activeFilter === "unassigned"
            ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
            : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-400">Unassigned Queue</p>
            <h4 className="text-xl font-bold text-neutral-100">{unassignedCount} Tasks</h4>
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 transition-transform ${activeFilter === "unassigned" ? "text-blue-400 translate-x-1" : "text-neutral-500"}`} />
      </div>
    </div>
  );
};

export default TasksTriageBar;