import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";
import { orgApi } from "../api/org.api";
import { queryKeys } from "../api/queryKeys";
import { useOrganisation } from "../context/OrganisationContext";
import { Kanban, Calendar, Users, BarChart3 } from "lucide-react";
import TasksTab from "../components/tasks/TasksTab";
import PlanAndDesignTab from "../components/project/Plan&DesignTab/PlanAndDesignTab";
import WorkloadTab from "../components/project/WorkloadTab/WorkloadTab";
import InsightsTab from "../components/project/InsightsTab/InsightsTab";

const loadProject = async (organisationId, projectId) => {
  const response = await projectApi.getById(organisationId, projectId);
  return {
    project: response.data.project || response.data,
    phases: response.data.project?.phases || response.data.phases || [],
  };
};

const loadTasks = async (organisationId, projectId) => {
  const response = await taskApi.getByProject(organisationId, projectId);
  return response.data.tasks || response.data || [];
};

const loadMembers = async (organisationId) => {
  const response = await orgApi.getMembers(organisationId);
  const members = response.data.members || response.data || [];
  return Array.isArray(members) ? members : [];
};

export default function ProjectDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedOrganisation } = useOrganisation();
  const projectId = params.projectId || params.id;
  const urlOrganisationId = params.orgId;
  const organisationId = urlOrganisationId || selectedOrganisation?._id;
  const [activeTab, setActiveTab] = useState("plan-design");

  useEffect(() => {
    if (
      selectedOrganisation?._id &&
      urlOrganisationId &&
      selectedOrganisation._id !== urlOrganisationId
    ) {
      navigate(`/org/${selectedOrganisation._id}`, { replace: true });
    }
  }, [selectedOrganisation?._id, urlOrganisationId, navigate]);

  const projectQuery = useQuery({
    queryKey: queryKeys.project(organisationId, projectId),
    queryFn: () => loadProject(organisationId, projectId),
    enabled: Boolean(organisationId && projectId),
    staleTime: 60_000,
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(organisationId, projectId),
    queryFn: () => loadTasks(organisationId, projectId),
    enabled: Boolean(organisationId && projectId),
    staleTime: 20_000,
  });

  const membersQuery = useQuery({
    queryKey: queryKeys.members(organisationId),
    queryFn: () => loadMembers(organisationId),
    enabled: Boolean(organisationId),
    staleTime: 45_000,
  });

  const refreshWorkspace = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(organisationId, projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(organisationId, projectId),
      }),
    ]);
  };

  const { project, phases } = projectQuery.data || {
    project: null,
    phases: [],
  };
  const tasks = tasksQuery.data || [];
  const members = membersQuery.data || [];
  const tabs = useMemo(
    () => [
      { id: "plan-design", label: "Plan & Design", icon: Calendar },
      { id: "tasks", label: "Tasks", icon: Kanban },
      { id: "workload", label: "Workload", icon: Users },
      { id: "insights", label: "Insights", icon: BarChart3 },
    ],
    []
  );

  if (projectQuery.isPending) {
    return <div className="p-6 text-gray-400">Loading project details...</div>;
  }

  if (projectQuery.isError) {
    const message =
      projectQuery.error?.response?.data?.message ||
      "Failed to load project workspace";
    return <div className="p-6 text-red-500">{message}</div>;
  }

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {project?.name || "Project Details"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {project?.description || "Project Workspace"}
        </p>
      </div>

      <div className="flex border-b border-border space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${
                isActive
                  ? "border-orange-300 text-orange-700 bg-orange-50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "plan-design" && (
        <PlanAndDesignTab
          project={project}
          phases={phases}
          tasks={tasks}
          orgId={organisationId}
          projectId={projectId}
          onRefresh={refreshWorkspace}
        />
      )}

      {activeTab === "tasks" && (
        <TasksTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={organisationId}
          projectId={projectId}
          onRefresh={refreshWorkspace}
        />
      )}

      {activeTab === "workload" && (
        <WorkloadTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={organisationId}
          projectId={projectId}
        />
      )}

      {activeTab === "insights" && (
        <InsightsTab
          project={project}
          phases={phases}
          tasks={tasks}
          members={members}
          orgId={organisationId}
          projectId={projectId}
        />
      )}
    </div>
  );
}
