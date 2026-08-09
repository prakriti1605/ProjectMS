import React, { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle, Calendar, User, Tag, Clock } from "lucide-react";
import { taskApi } from "../../../api/task.api";

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  orgId,
  projectId,
  phases = [],
  members = [],
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    phase: "",
    assignedTo: "",
    dueDate: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        phase: task.phase?._id || task.phase || "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      });
      setShowDeleteConfirm(false);
      setError("");
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await taskApi.update(orgId, projectId, task._id, formData);

      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.message || err.message || "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  try {
    setLoading(true);
    setError("");

    // 1. Call Backend DELETE API
    await taskApi.delete(orgId, projectId, task._id);

    // 2. Pass deleted task ID to parent component for instant UI cleanup
    if (onTaskDeleted) {
      onTaskDeleted(task._id);
    } else if (onRefresh) {
      onRefresh();
    }

    onClose();
  } catch (err) {
    console.error("Error deleting task:", err);
    setError(err.response?.data?.message || err.message || "Failed to delete task.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#1E1E24] p-6 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <span className="text-xs font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
            Task Details
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm((prev) => !prev)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
              title="Delete Task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Red Inline Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Delete Task?</span>
            </div>
            <p className="mt-1 text-gray-300">
              Are you sure you want to delete <strong className="text-white">"{task.title}"</strong>? This action cannot be undone.
            </p>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded px-3 py-1.5 font-medium text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="rounded bg-red-600 px-3.5 py-1.5 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete Task"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add description..."
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Phase & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Phase</label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="">Unassigned Phase</option>
                {phases.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Assignee</label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const userObj = m.user || m;
                  return (
                    <option key={userObj._id} value={userObj._id}>
                      {userObj.username || userObj.email}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none [color-scheme:dark]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}