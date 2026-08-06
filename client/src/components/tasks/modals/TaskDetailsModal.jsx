import React, { useState, useEffect } from "react";
import { 
  X, 
  Trash2, 
  Calendar, 
  User, 
  Layers, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Circle,
  Loader2 
} from "lucide-react";
import { taskApi } from "../../../api/task.api"; // Adjust relative path if needed

/**
 * TaskDetailsModal - Modal/Drawer to view, edit, or delete an existing task.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - task: Object | null (The task currently selected)
 * - orgId: string
 * - projectId: string
 * - phases: Array
 * - members: Array
 * - onTaskUpdated: () => void
 */
const TaskDetailsModal = ({
  isOpen,
  onClose,
  task,
  orgId,
  projectId,
  phases = [],
  members = [],
  onTaskUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    phase: "",
    assignedTo: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form state when a task is selected
  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        phase: task.phase?._id || task.phase || "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      });
      setError(null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Update Task Details Handler
  const handleUpdate = async (e) => {
  e.preventDefault();
  if (!formData.title.trim()) {
    setError("Task title cannot be empty.");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    // 💡 Sanitizing empty strings to null or undefined prevents Mongoose Object ID CastErrors
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || "",
      status: formData.status,
      priority: formData.priority,
      phase: formData.phase && formData.phase !== "" ? formData.phase : null,
      assignedTo: formData.assignedTo && formData.assignedTo !== "" ? formData.assignedTo : null,
      dueDate: formData.dueDate && formData.dueDate !== "" ? formData.dueDate : null,
    };

    await taskApi.update(orgId, projectId, task._id, payload);

    if (onTaskUpdated) onTaskUpdated();
    onClose();
  } catch (err) {
    console.error("Error updating task:", err);
    setError(err.response?.data?.message || err.message || "Failed to update task.");
  } finally {
    setLoading(false);
  }
};

  // 2. Delete Task Handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError(null);

      await taskApi.delete(orgId, projectId, task._id);

      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete task.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-800 text-neutral-400">
              Task Details
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading || loading}
              className="text-neutral-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              title="Delete Task"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add description..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Grid Options: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500 capitalize"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-500" />
                <span>Priority</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500 capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Grid Options: Phase & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phase Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-500" />
                <span>Phase</span>
              </label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500 capitalize"
              >
                <option value="">Unscheduled / Floating</option>
                {phases.map((phase) => (
                  <option key={phase._id} value={phase._id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>Assignee</span>
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member.user?._id || member._id}>
                    {member.user?.username || member.username || "Member"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Due Date</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailsModal;