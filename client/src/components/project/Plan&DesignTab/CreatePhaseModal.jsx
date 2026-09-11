import React, { useState } from "react";
import { X } from "lucide-react";
import { projectApi } from "../../../api/project.api"; // Adjust relative path if needed

export default function CreatePhaseModal({
  isOpen,
  onClose,
  orgId,
  projectId,
  onSuccess,
}) {
  // 1. Properly initialize formData state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Active", // Default phase lifecycle status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Phase name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call API to create phase
      await projectApi.createPhase(orgId, projectId, formData);

      // Reset form state
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "Active",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create phase:", err);
      setError(err.response?.data?.message || "Failed to create phase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E24] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Create New Phase</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phase Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Phase Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#121212] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g. Discovery & Wireframing"
            />
          </div>

          {/* Phase Lifecycle Status */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Phase Lifecycle Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-[#121212] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            >
              <option value="Active">🔵 Active (In Progress)</option>
              <option value="Scheduled">📅 Scheduled (Upcoming)</option>
              <option value="On Hold">⏸️ On Hold</option>
              <option value="Completed">✅ Completed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#121212] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              placeholder="Provide scope or phase deliverables..."
            />
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Phase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}