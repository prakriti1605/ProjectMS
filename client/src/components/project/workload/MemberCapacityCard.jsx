import React from "react";
import MemberTaskList from "./MemberTaskList";

export default function MemberCapacityCard({ member, isExpanded, onToggleExpand }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all duration-200 overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Profile */}
        <div className="flex items-center space-x-3 min-w-[220px]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {member.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">{member.username}</h4>
            <span className="inline-block text-xs text-slate-400 capitalize">{member.role}</span>
          </div>
        </div>

        {/* Capacity Badge & Percentage Share */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${member.statusBg}`}>
              {member.capacityStatus === "available"
                ? "🔵 Available"
                : member.capacityStatus === "optimal"
                ? "🟢 Optimal"
                : "🔴 Overloaded"}
            </span>
            <span className="text-xs text-slate-400 italic">• {member.recommendation}</span>
          </div>
        </div>

        {/* Workload Share % & Task Counters */}
        <div className="flex items-center space-x-3">
          {/* Percentage Share Pill */}
          <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 min-w-[80px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Project Share</p>
            <p className="text-sm font-bold text-orange-400">{member.workloadPercentage}%</p>
          </div>

          {/* Active Tasks Count */}
          <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 min-w-[75px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Active Load</p>
            <p className="text-sm font-bold text-white">{member.activeCount} <span className="text-[10px] text-slate-500 font-normal">tasks</span></p>
          </div>

          {/* Due This Week */}
          <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 min-w-[75px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Due 7 Days</p>
            <p className={`text-sm font-bold ${member.dueThisWeekCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
              {member.dueThisWeekCount}
            </p>
          </div>

          {/* High Priority Count */}
          <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 min-w-[75px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">High Priority</p>
            <p className={`text-sm font-bold ${member.highPriorityCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
              {member.highPriorityCount}
            </p>
          </div>

          {/* Expand Drawer Button */}
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && <MemberTaskList tasks={member.activeTasks} />}
    </div>
  );
}