import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { orgApi } from "../api/org.api";
import { useOrganisation } from "../context/OrganisationContext";

import { Kanban, Calendar, Users, BarChart3 } from "lucide-react";

import TasksTab from "../components/tasks/TasksTab";
import PlanAndDesignTab from "../components/project/Plan&DesignTab/PlanAndDesignTab";
import WorkloadTab from "../components/project/WorkloadTab/WorkloadTab";
import InsightsTab from "../components/project/InsightsTab/InsightsTab";

export default function ProjectDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { selectedOrganisation } = useOrganisation();

  const projectId = params.projectId || params.id;
  const urlOrgId = params.orgId;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);
  const [members, setMembers] = useState([]);

  // 1️⃣ Default active tab set to "plan-design"
  const [activeTab, setActiveTab] = useState("plan-design");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const effectiveOrgId =
    urlOrgId ||
    selectedOrganisation?._id ||
    project?.organisation?._id ||
    project?.organisation;

  // 🔄 1. Fix: Sync page with global organisation context switch
  useEffect(() => {
    if (
      selectedOrganisation?._id &&
      urlOrgId &&
      selectedOrganisation._id !== urlOrgId
    ) {
      navigate(`/org/${selectedOrganisation._id}`, { replace: true });
    }
  }, [selectedOrganisation?._id, urlOrgId, navigate]);

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
          const loadedMembers =
            membersRes.data?.members || membersRes.data || [];
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

  // 2️⃣ Fix: Configured tabs list in exact required order
  const tabs = [
    { id: "plan-design", label: "Plan & Design", icon: Calendar },
    { id: "tasks", label: "Tasks", icon: Kanban },
    { id: "workload", label: "Workload", icon: Users },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  if (loading) {
    return <div className="p-6 text-gray-400">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
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
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
                isActive
                  ? "border-orange-500 text-orange-400 bg-orange-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "plan-design" && (
        <PlanAndDesignTab
          project={project}
          phases={phases}
          tasks={tasks}
          orgId={effectiveOrgId}
          projectId={projectId}
          onRefresh={fetchProjectData}
        />
      )}

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