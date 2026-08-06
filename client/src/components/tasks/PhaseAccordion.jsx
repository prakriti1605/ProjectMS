import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import TaskRow from "./TaskRow";

/**
 * PhaseAccordion - Renders a collapsible phase container with progress tracking and task list.
 * 
 * Props:
 * - phase: Object | null (Phase metadata or null for Unscheduled tasks)
 * - tasks: Array (List of tasks belonging to this phase)
 * - onStatusChange: (taskId: string, newStatus: string) => void
 * - onTaskClick: (task: Object) => void
 * - onAddTaskClick: (phaseId: string | null) => void
 */
const PhaseAccordion = ({ 
  phase, 
  tasks = [], 
  onStatusChange, 
  onTaskClick, 
  onAddTaskClick 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate Phase Progress Percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const phaseId = phase ? phase._id : null;
  const phaseTitle = phase ? phase.name : "Unscheduled / Floating Tasks";

  return (
    <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
      {/* Phase Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-5 py-4 bg-neutral-900/80 hover:bg-neutral-800/60 transition-colors cursor-pointer select-none border-b border-neutral-800/80"
      >
        {/* Left: Collapse Icon & Phase Title */}
        <div className="flex items-center space-x-3">
          <button className="text-neutral-400 hover:text-white transition-colors">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          <h3 className="font-semibold text-neutral-100 text-base flex items-center gap-2">
            {phaseTitle}
            <span className="text-xs font-normal text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
              {totalTasks} {totalTasks === 1 ? "Task" : "Tasks"}
            </span>
          </h3>
        </div>

        {/* Right: Progress Bar & Inline Add Button */}
        <div className="flex items-center space-x-6" onClick={(e) => e.stopPropagation()}>
          {totalTasks > 0 && (
            <div className="flex items-center space-x-3 hidden sm:flex">
              <div className="w-32 bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-neutral-400 min-w-[32px] text-right">
                {progressPercentage}%
              </span>
            </div>
          )}

          <button
            onClick={() => onAddTaskClick(phaseId)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all text-xs font-medium border border-orange-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className="divide-y divide-neutral-800/40">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onStatusChange={onStatusChange}
                onTaskClick={onTaskClick}
              />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-neutral-500">
              No tasks in this phase yet. Click <span className="text-neutral-400 font-medium">"+ Add Task"</span> to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhaseAccordion;