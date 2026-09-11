import React, { useState, useEffect } from "react";
import { X, Calendar, User, Layers, Tag, Loader2 } from "lucide-react";
import { taskApi } from "../../../api/task.api"; // Adjust relative path if needed

/**
 * CreateTaskModal - Modal for creating a new task.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - orgId: string
 * - projectId: string
 * - phases: Array (List of project phases)
 * - members: Array (List of organisation members from getOrgMembers)
 * - initialPhaseId: string | null (Pre-selected phase)
 * - onTaskCreated: () => void (Callback to trigger task refetch)
 */
const CreateTaskModal = ({
  isOpen,
  onClose,
  orgId,
  projectId,
  phases = [],
  members = [],
  initialPhaseId = null,
  onTaskCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    phase: "",
    assignedTo: "",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync initialPhaseId when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        phase: initialPhaseId || "",
        assignedTo: "",
        dueDate: "",
      });
      setError(null);
    }
  }, [isOpen, initialPhaseId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean payload: pass null for empty selects to avoid Mongoose CastErrors
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        phase: formData.phase || null,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null,
      };

      await taskApi.create(orgId, projectId, payload);

      if (onTaskCreated) {
        onTaskCreated();
      }
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || err.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <h3 className="text-lg font-semibold text-white">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Design Landing Page Wireframes"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
              autoFocus
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
              placeholder="Add additional context or requirements..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
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

          {/* Grid Options: Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Actions */}
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
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;