import React, { useMemo, useState } from "react";
import BandwidthSummary from "./BandwidthSummary";
import MemberCapacityCard from "./MemberCapacityCard";
import {
  normalizeMember,
  getTaskAssigneeId,
  isTaskActive,
  isDueThisWeek,
  calculateCapacityStatus,
} from "./workload.utils";

export default function WorkloadTab({ tasks = [], members = [] }) {
  const [expandedUser, setExpandedUser] = useState(null);

  // Total active incomplete tasks across the entire project
  const totalActiveProjectTasks = useMemo(() => {
    return tasks.filter(isTaskActive).length;
  }, [tasks]);

  // Process members with relative workload percentage calculation
  const memberCapacities = useMemo(() => {
    if (!Array.isArray(members)) return [];

    return members.map(normalizeMember).filter(Boolean).map((member) => {
      const memberTasks = tasks.filter((t) => getTaskAssigneeId(t) === member.userId);
      const activeTasks = memberTasks.filter(isTaskActive);

      const dueThisWeekCount = activeTasks.filter(isDueThisWeek).length;
      const highPriorityCount = activeTasks.filter(
        (t) => (t.priority || "").toLowerCase() === "high"
      ).length;

      // Dynamic Workload Share calculation
      const capacityInfo = calculateCapacityStatus(activeTasks.length, totalActiveProjectTasks);

      return {
        ...member,
        activeTasks,
        activeCount: activeTasks.length,
        dueThisWeekCount,
        highPriorityCount,
        ...capacityInfo,
      };
    });
  }, [members, tasks, totalActiveProjectTasks]);

  // Overall summary for top cards
  const capacitySummary = useMemo(() => {
    let available = 0, optimal = 0, overloaded = 0;
    memberCapacities.forEach((m) => {
      if (m.capacityStatus === "available") available++;
      if (m.capacityStatus === "optimal") optimal++;
      if (m.capacityStatus === "overloaded") overloaded++;
    });
    return { available, optimal, overloaded };
  }, [memberCapacities]);

  return (
    <div className="space-y-6">
      <BandwidthSummary summary={capacitySummary} />

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Team Member Workload & Capacity</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Monitor active task density, upcoming deadlines, and delegation availability
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {memberCapacities.length} Members • {totalActiveProjectTasks} Active Tasks Total
          </span>
        </div>

        <div className="space-y-4">
          {memberCapacities.map((member) => (
            <MemberCapacityCard
              key={member.userId}
              member={member}
              isExpanded={expandedUser === member.userId}
              onToggleExpand={() =>
                setExpandedUser((prev) => (prev === member.userId ? null : member.userId))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}