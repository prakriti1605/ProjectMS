import React, { useState, useMemo } from "react";
import { Plus, AlertCircle, X } from "lucide-react";
import { projectApi } from "../../../api/project.api";
import { toInputDate } from "../../../utils/dateUtils";

import ProjectTimelineHeader from "./ProjectTimelineHeader";
import PhaseListCard from "./PhaseListCard";
import GanttChartOverview from "./GanttChartOverview";

export default function PlanAndDesignTab({
  project,
  phases = [],
  tasks = [],
  orgId,
  projectId,
  onRefresh,
}) {
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [deleteConfirmPhase, setDeleteConfirmPhase] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [timelineForm, setTimelineForm] = useState({
    startDate: "",
    endDate: "",
  });

  const [phaseForm, setPhaseForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "Scheduled",
    description: "",
  });

  // 🔹 Sort phases chronologically by startDate
  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => {
      const timeA = new Date(a.startDate).getTime() || 0;
      const timeB = new Date(b.startDate).getTime() || 0;
      return timeA - timeB;
    });
  }, [phases]);

  // Open Timeline Modal
  const handleOpenTimeline = () => {
    setTimelineForm({
      startDate: toInputDate(project?.startDate),
      endDate: toInputDate(project?.endDate),
    });
    setError("");
    setIsTimelineModalOpen(true);
  };

  // Open Phase Modal
  const handleOpenPhaseModal = (phase = null) => {
    if (phase) {
      setSelectedPhase(phase);
      setPhaseForm({
        name: phase.name || "",
        startDate: toInputDate(phase.startDate),
        endDate: toInputDate(phase.endDate),
        status: phase.status || "Scheduled",
        description: phase.description || "",
      });
    } else {
      setSelectedPhase(null);
      setPhaseForm({
        name: "",
        startDate: toInputDate(project?.startDate) || "",
        endDate: toInputDate(project?.endDate) || "",
        status: "Scheduled",
        description: "",
      });
    }
    setError("");
    setIsPhaseModalOpen(true);
  };

  // Save Timeline
  const handleSaveTimeline = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await projectApi.updateTimeline(orgId, projectId, timelineForm);
      setIsTimelineModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update timeline");
    } finally {
      setLoading(false);
    }
  };

  // Save Phase
  const handleSavePhase = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (selectedPhase) {
        await projectApi.updatePhase(orgId, projectId, selectedPhase._id, phaseForm);
      } else {
        await projectApi.createPhase(orgId, projectId, phaseForm);
      }
      setIsPhaseModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save phase");
    } finally {
      setLoading(false);
    }
  };

  // Delete Phase
  const handleDeletePhase = async () => {
    if (!deleteConfirmPhase) return;
    try {
      setLoading(true);
      setError("");
      await projectApi.deletePhase(orgId, projectId, deleteConfirmPhase._id);
      setDeleteConfirmPhase(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete phase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectTimelineHeader project={project} onOpenEditModal={handleOpenTimeline} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Project Phases</h3>
            <p className="text-xs text-slate-400">Sequential milestones and deliverables mapping.</p>
          </div>
          <button
            onClick={() => handleOpenPhaseModal(null)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-orange-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Phase
          </button>
        </div>

        {sortedPhases.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">No phases created yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "+ Add Phase" to construct your project workflow.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {/* 🔹 Render sortedPhases */}
            {sortedPhases.map((phase) => (
              <PhaseListCard
                key={phase._id}
                phase={phase}
                tasks={tasks}
                onEdit={handleOpenPhaseModal}
                onDelete={setDeleteConfirmPhase}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Pass sortedPhases into GanttChartOverview */}
      <GanttChartOverview project={project} phases={sortedPhases} />

      {/* Modals remain unchanged */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Master Timeline</h3>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">{error}</div>}
            <form onSubmit={handleSaveTimeline} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={timelineForm.startDate}
                  onChange={(e) => setTimelineForm({ ...timelineForm, startDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={timelineForm.endDate}
                  onChange={(e) => setTimelineForm({ ...timelineForm, endDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsTimelineModalOpen(false)} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPhaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{selectedPhase ? "Edit Phase" : "Create New Phase"}</h3>
              <button onClick={() => setIsPhaseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">{error}</div>}
            <form onSubmit={handleSavePhase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Phase Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery & Wireframing"
                  value={phaseForm.name}
                  onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={phaseForm.startDate}
                    onChange={(e) => setPhaseForm({ ...phaseForm, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={phaseForm.endDate}
                    onChange={(e) => setPhaseForm({ ...phaseForm, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Status</label>
                <select
                  value={phaseForm.status}
                  onChange={(e) => setPhaseForm({ ...phaseForm, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={phaseForm.description}
                  onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsPhaseModalOpen(false)} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50">
                  {loading ? "Saving..." : selectedPhase ? "Update Phase" : "Create Phase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmPhase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Phase?</h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteConfirmPhase.name}"</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmPhase(null)} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
              <button type="button" onClick={handleDeletePhase} disabled={loading} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50">
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}