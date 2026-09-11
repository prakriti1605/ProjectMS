import React from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  AlertCircle 
} from "lucide-react";

/**
 * TaskRow - Renders an individual task inside a phase or floating section.
 */
const TaskRow = ({ task, onStatusChange, onTaskClick }) => {
  if (!task) return null;

  // 1. Priority Badge Styling
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium":
      case "med":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  // 2. Status Badge Styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/10 text-emerald-400";
      case "in_review":
        return "bg-amber-500/10 text-amber-400";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  // 3. Status Action Button
  const renderStatusButton = () => {
    const isDone = task.status === "done";
    const isInReview = task.status === "in_review";

    if (isDone) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task._id, "todo");
          }}
          className="text-emerald-500 hover:text-emerald-400 transition-colors p-1"
          title="Mark as Todo"
        >
          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
        </button>
      );
    }

    if (isInReview) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task._id, "done");
          }}
          className="text-amber-400 hover:text-amber-300 transition-colors p-1"
          title="In Review - Click to Approve & Complete"
        >
          <Clock className="w-5 h-5" />
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task._id, task.status === "todo" ? "in_progress" : "in_review");
        }}
        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
        title="Advance Status"
      >
        <Circle className="w-5 h-5" />
      </button>
    );
  };

  // 4. Due Date Formatting & Overdue Logic
  const isOverdue = 
    task.status !== "done" && 
    task.dueDate && 
    new Date(task.dueDate) < new Date();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      onClick={(e) => {
        console.log("1. direct click on taskrow div",task);
        console.log("type of onTaskClick", typeof onTaskClick);
        if(onTaskClick) onTaskClick(task);
      } }
      className="group flex cursor-pointer items-center justify-between border-b border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary/60"
    >
      {/* Left: Checkbox / Status & Title */}
      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
        {renderStatusButton()}

        <span
          className={`font-medium truncate transition-colors ${
            task.status === "done"
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Right: Priority, Due Date, Assignee, Status Tag */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* Priority Badge */}
        {task.priority && (
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded border capitalize ${getPriorityBadge(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        )}

        {/* Due Date */}
        {formattedDueDate && (
          <div
            className={`flex items-center space-x-1.5 text-xs ${
              isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDueDate}</span>
            {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
          </div>
        )}

        {/* Assignee Avatar */}
        <div className="flex items-center space-x-1.5 min-w-[100px] justify-end">
          {task.assignedTo ? (
            <div className="flex items-center space-x-1.5 text-xs text-foreground">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-semibold flex items-center justify-center text-[10px] border border-orange-500/30">
                {task.assignedTo.username?.slice(0, 2).toUpperCase() || "U"}
              </div>
              <span className="truncate max-w-[80px] hidden sm:inline">
                {task.assignedTo.username}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Unassigned</span>
            </div>
          )}
        </div>

        {/* Status Tag */}
        <span
          className={`px-2 py-0.5 text-xs rounded font-medium capitalize hidden md:inline-block ${getStatusBadgeStyle(
            task.status
          )}`}
        >
          {task.status?.replace("_", " ") || "todo"}
        </span>
      </div>
    </div>
  );
};

export default TaskRow;
