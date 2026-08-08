import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrganisation } from "../context/OrganisationContext";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { Kanban, Calendar, Users, BarChart3 } from "lucide-react";

// Tab Components
import TasksTab from "../components/project/tabs/TasksTab";
import PlanAndDesignTab from "../components/project/tabs/PlanAndDesignTab";
import WorkloadTab from "../components/project/tabs/WorkloadTab";
import InsightsTab from "../components/project/tabs/InsightsTab";

export default function ProjectDetails() {
  const params = useParams();
  const { selectedOrganisation } = useOrganisation();

  // Extract Params safely (Supports both route patterns)
  const projectId = params.projectId || params.id;
  
  // State
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  

  // Safely resolve Organisation ID
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

      // Single or 2-parameter fetch
      const projRes = await projectApi.getById(effectiveOrgId, projectId);
      const loadedProject = projRes.data.project || projRes.data;

      setProject(loadedProject);
      setPhases(loadedProject?.phases || projRes.data.phases || []);

      // Fetch tasks for the project
      try {
        const taskRes = await taskApi.getByProject(effectiveOrgId, projectId);
        setTasks(taskRes.data.tasks || taskRes.data || []);
      } catch (taskErr) {
        console.warn("Task fetch warning:", taskErr);
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to load project details:", err);
      setError(err.response?.data?.message || "Failed to load project workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mr-3"></div>
        Loading Project Workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 max-w-2xl mx-auto my-8 text-center">
        <p className="font-semibold text-lg">{error}</p>
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
    <div className="space-y-6 p-6 bg-[#121212] min-h-screen text-white">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {project?.name || "Project Details"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {project?.description || "Project Workspace"}
          </p>
        </div>
      </div>

      {/* 4 Tab Selector Navigation */}
      <div className="flex border-b border-gray-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "tasks"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Kanban className="w-4 h-4" />
          Tasks
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "plan"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Plan & Design
        </button>

        <button
          onClick={() => setActiveTab("workload")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "workload"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Workload
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
            activeTab === "insights"
              ? "border-orange-500 text-orange-400 bg-orange-500/5"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Insights
        </button>
      </div>

      {/* Tab Component Views */}
      <div className="pt-2">
        {activeTab === "tasks" && (
          <TasksTab
            project={project}
            phases={phases}
            tasks={tasks}
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
            orgId={effectiveOrgId}
            projectId={projectId}
          />
        )}

        {activeTab === "insights" && (
          <InsightsTab
            project={project}
            phases={phases}
            tasks={tasks}
            orgId={effectiveOrgId}
            projectId={projectId}
          />
        )}
      </div>
    </div>
  );
}