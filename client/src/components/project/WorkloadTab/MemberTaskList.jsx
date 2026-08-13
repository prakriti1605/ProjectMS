import React from "react";

export default function MemberTaskList({ tasks = [] }) {
  return (
    <div className="border-t border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
          Active Assigned Tasks ({tasks.length})
        </h5>
        <span className="text-[11px] text-slate-500 italic">
          Showing incomplete deliverables only
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">
          No active tasks currently assigned to this member.
        </p>
      ) : (
        tasks.map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-colors text-sm"
          >
            <div className="flex items-center space-x-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  task.priority === "High"
                    ? "bg-rose-500"
                    : task.priority === "Medium"
                    ? "bg-amber-500"
                    : "bg-blue-500"
                }`}
              />
              <span className="font-medium text-slate-200">{task.title}</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {task.priority || "Normal"}
              </span>

              {task.dueDate && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {task.status || "In Progress"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}