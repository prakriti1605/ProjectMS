import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { orgApi } from "../api/org.api";
import { useOrganisation } from "../context/OrganisationContext";

import { Kanban, Calendar, Users, BarChart3 } from "lucide-react";

import TasksTab from "../components/project/tabs/TasksTab";
import PlanAndDesignTab from "../components/project/tabs/PlanAndDesignTab";
import WorkloadTab from "../components/project/workload/WorkloadTab";
import InsightsTab from "../components/project/Insights/InsightsTab";

export default function ProjectDetails() {
  const params = useParams();
  const { selectedOrganisation } = useOrganisation();

  const projectId = params.projectId || params.id;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [members, setMembers] = useState([]); // Defaults to an empty array
  const [activeTab, setActiveTab] = useState("tasks");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const effectiveOrgId =
    params.orgId ||
    selectedOrganisation?._id ||
    project?.organisation?._id ||
    project?.organisation;

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError("");

      // 1. Fetch Project Details
      const projRes = await projectApi.getById(effectiveOrgId, projectId);
      const loadedProject = projRes.data.project || projRes.data;
      setProject(loadedProject);
      setPhases(loadedProject?.phases || projRes.data.phases || []);

      const orgIdToUse =
        effectiveOrgId ||
        loadedProject?.organisation?._id ||
        loadedProject?.organisation;

      // 2. Fetch Tasks
      try {
        const taskRes = await taskApi.getByProject(orgIdToUse, projectId);
        setTasks(taskRes.data.tasks || taskRes.data || []);
      } catch (taskErr) {
        console.warn("Task fetch warning:", taskErr);
        setTasks([]);
      }

      // 3. Fetch Organisation Members safely
      if (orgIdToUse) {
        try {
          const membersRes = await orgApi.getMembers(orgIdToUse);
          // Safely extracts array from { success: true, members: [...] }
          const loadedMembers = membersRes.data?.members || membersRes.data || [];
          setMembers(Array.isArray(loadedMembers) ? loadedMembers : []);
        } catch (memErr) {
          console.warn("Members fetch warning:", memErr);
          setMembers([]);
        }
      }
    } catch (err) {
      console.error("Failed to load project details:", err);
      setError(
        err.response?.data?.message || "Failed to load project workspace"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, effectiveOrgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Loading Project Workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchProjectData}
          className="mt-4 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded-lg text-sm transition"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {project?.name || "Project Details"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {project?.description || "Project Workspace"}
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "tasks"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Kanban className="w-4 h-4" /> Tasks
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "plan"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" /> Plan & Design
        </button>

        <button
          onClick={() => setActiveTab("workload")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "workload"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Users className="w-4 h-4" /> Workload
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "insights"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Insights
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "tasks" && (
        <TasksTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={effectiveOrgId}
          projectId={projectId}
          onRefresh={fetchProjectData}
        />
      )}

      {activeTab === "plan" && (
        <PlanAndDesignTab
          project={project}
          phases={phases}
          tasks={tasks}
          orgId={effectiveOrgId}
          projectId={projectId}
          onRefresh={fetchProjectData}
        />
      )}

      {activeTab === "workload" && (
        <WorkloadTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={effectiveOrgId}
          projectId={projectId}
        />
      )}

      {activeTab === "insights" && (
        <InsightsTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={effectiveOrgId}
          projectId={projectId}
        />
      )}
    </div>
  );
}