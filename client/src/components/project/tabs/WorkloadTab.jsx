import React from "react";
import { AlertCircle, Filter } from "lucide-react";

export default function WorkloadTab({ tasks = [] }) {
  // Aggregate assigned tasks per user
  const memberWorkload = tasks.reduce((acc, task) => {
    const user = task.assignee || { _id: "unassigned", username: "Unassigned", role: "N/A" };
    if (!acc[user._id]) {
      acc[user._id] = { user, tasks: [], score: 0 };
    }
    acc[user._id].tasks.push(task);
    
    // Priority Weighting
    const weight = task.priority === "High" ? 30 : task.priority === "Medium" ? 20 : 10;
    acc[user._id].score += weight;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold">Resource Allocation</h2>
          <p className="text-sm text-gray-400">Team Capacity & Active Bandwidth Matrix</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1E1E24] px-3 py-1.5 text-xs text-gray-300">
            <Filter className="h-3.5 w-3.5" /> All Roles
          </button>
          <span className="text-xs text-gray-500">Weekly View</span>
        </div>
      </div>

      {/* Member Capacity Grid */}
      <div className="rounded-xl border border-white/10 bg-[#1E1E24] overflow-hidden">
        <div className="grid grid-cols-12 border-b border-white/10 bg-black/20 p-4 text-xs font-mono text-gray-400">
          <div className="col-span-3">TEAM MEMBER</div>
          <div className="col-span-3">CAPACITY</div>
          <div className="col-span-6">ACTIVE TASKS (THIS WEEK)</div>
        </div>

        <div className="divide-y divide-white/5">
          {Object.values(memberWorkload).map(({ user, tasks, score }) => {
            const capacityPercent = Math.min(score, 120);
            const isOverloaded = capacityPercent >= 100;

            return (
              <div key={user._id} className="grid grid-cols-12 items-center p-4 gap-4 text-sm">
                {/* User column */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600/20 text-orange-400 font-bold border border-orange-500/30">
                    {user.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {user.username}
                      {isOverloaded && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                    <div className="text-xs text-gray-400">{user.role || "Member"}</div>
                  </div>
                </div>

                {/* Capacity meter */}
                <div className="col-span-3 pr-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={isOverloaded ? "text-red-400 font-bold" : "text-orange-400"}>
                      {capacityPercent}%
                    </span>
                    <span className="text-gray-500">{(capacityPercent * 0.4).toFixed(0)}h / 40h</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#121212] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverloaded ? "bg-red-500" : capacityPercent > 75 ? "bg-orange-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Task Chips */}
                <div className="col-span-6 flex flex-wrap gap-2">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-md border border-white/10 bg-[#121212] p-2 text-xs hover:border-orange-500/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-gray-200">{task.title}</span>
                        <span className={`text-[10px] font-bold ${task.priority === "High" ? "text-red-400" : "text-amber-400"}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500">Due: {task.dueDate || "Next Week"}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}