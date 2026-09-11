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
  const [isOpen, setIsOpen] = useState(false);

  // Calculate Phase Progress Percentage
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const phaseId = phase ? phase._id : null;
  const phaseTitle = phase ? phase.name : "Unscheduled / Floating Tasks";

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Phase Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer select-none items-center justify-between border-b border-border bg-secondary/50 px-5 py-4 transition-colors hover:bg-secondary"
      >
        {/* Left: Collapse Icon & Phase Title */}
        <div className="flex items-center space-x-3">
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            {phaseTitle}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {totalTasks} {totalTasks === 1 ? "Task" : "Tasks"}
            </span>
          </h3>
        </div>

        {/* Right: Progress Bar & Inline Add Button */}
        <div className="flex items-center space-x-6" onClick={(e) => e.stopPropagation()}>
          {totalTasks > 0 && (
            <div className="flex items-center space-x-3 hidden sm:flex">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="min-w-[32px] text-right text-xs font-medium text-muted-foreground">
                {progressPercentage}%
              </span>
            </div>
          )}

          <button
            onClick={() => onAddTaskClick(phaseId)}
            className="flex items-center space-x-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className="divide-y divide-border">
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
            <div className="py-8 text-center text-sm text-muted-foreground">
              No tasks in this phase yet. Click <span className="font-medium text-foreground">"+ Add Task"</span> to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhaseAccordion;
