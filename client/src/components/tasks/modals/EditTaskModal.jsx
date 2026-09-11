import React, { useState, useEffect } from "react";
import { X, CheckCircle, Clock, User, Tag, AlertCircle } from "lucide-react";
import { taskApi } from "../../api/task.api";

export default function EditTaskModal({ isOpen, onClose, task, orgId, projectId, onTaskUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form with existing task data when opened
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      });
      setError("");
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Updating Task:", { orgId, projectId, taskId: task._id, formData });

      // Matches taskApi.update(orgId, projectId, taskId, data)
      await taskApi.update(orgId, projectId, task._id, formData);

      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Task update error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#1E1E24] p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-orange-500">Edit Task</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Title <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
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
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-4 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
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
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="todo">Todo</option>
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
                className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
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
              className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none [color-scheme:dark]"
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