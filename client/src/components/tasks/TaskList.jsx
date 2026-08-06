import React, { useState } from "react";
import { Plus, Clock, User } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";

export default function TaskList({ tasks = [], projectId, orgId, onTaskUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tab Sub-Header with "+ New Task" Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tasks</h2>
          <p className="text-sm text-gray-400">Manage daily deliverables and assignments</p>
        </div>

        {/* + New Task Button (as seen in Image 1) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition shadow-lg"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {/* Kanban Task Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/10 bg-[#1E1E24] p-8 text-center text-gray-400">
            No tasks found in this project. Click <strong>+ New Task</strong> to add one.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-xl border border-white/10 bg-[#1E1E24] p-5 shadow-lg transition hover:border-orange-500/40"
            >
              <h3 className="font-bold text-white text-lg">{task.title}</h3>
              {task.description && (
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{task.description}</p>
              )}

              {/* Status & Priority Badges */}
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    task.priority === "High"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {task.priority || "Medium"}
                </span>

                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-mono text-gray-300 border border-white/10">
                  {task.status || "Todo"}
                </span>
              </div>

              {/* Card Footer: Assignee & Due Date */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
                <div className="flex items-center gap-1 text-orange-400">
                  <User className="h-3.5 w-3.5" />
                  <span>{task.assignee?.username || task.assignedTo || "Unassigned"}</span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Backend-Connected Task Creation Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        orgId={orgId}
        onTaskCreated={() => {
          if (onTaskUpdate) onTaskUpdate(); // Re-fetches project tasks from backend
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}