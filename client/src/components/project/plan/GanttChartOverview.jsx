import React from "react";
import { formatDate, calculateDuration } from "../../../utils/dateUtils";

export default function GanttChartOverview({ project, phases = [] }) {
  const totalProjectDays = calculateDuration(project?.startDate, project?.endDate);

  // 🔹 Fallback sort to guarantee chronological order in Gantt view
  const sortedPhases = [...phases].sort((a, b) => {
    const timeA = new Date(a.startDate).getTime() || 0;
    const timeB = new Date(b.startDate).getTime() || 0;
    return timeA - timeB;
  });

  const getBarStyle = (phaseStart, phaseEnd) => {
    if (!project?.startDate || !project?.endDate || totalProjectDays <= 0) {
      return { left: "0%", width: "100%" };
    }

    const pStart = new Date(project.startDate);
    const pEnd = new Date(project.endDate);
    const phStart = new Date(phaseStart);
    const phEnd = new Date(phaseEnd);

    const startClamped = phStart < pStart ? pStart : phStart;
    const endClamped = phEnd > pEnd ? pEnd : phEnd;

    const offsetDays = Math.max(0, (startClamped - pStart) / (1000 * 60 * 60 * 24));
    const durationDays = Math.max(1, (endClamped - startClamped) / (1000 * 60 * 60 * 24) + 1);

    const leftPercent = Math.min(100, Math.max(0, (offsetDays / totalProjectDays) * 100));
    const widthPercent = Math.min(100 - leftPercent, Math.max(2, (durationDays / totalProjectDays) * 100));

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  if (sortedPhases.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
      <h3 className="text-base font-bold text-white">Visual Timeline Overview</h3>
      <div className="space-y-3 pt-2">
        {sortedPhases.map((phase) => (
          <div key={`gantt-${phase._id}`} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">{phase.name}</span>
              <span>
                {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
              </span>
            </div>
            <div className="relative w-full bg-slate-800/80 h-7 rounded-lg overflow-hidden border border-slate-800">
              <div
                className="absolute top-1 bottom-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-md transition-all duration-300 flex items-center px-2"
                style={getBarStyle(phase.startDate, phase.endDate)}
              >
                <span className="text-[10px] font-bold text-white truncate">{phase.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}