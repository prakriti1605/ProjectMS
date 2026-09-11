import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Filter, Loader2, Plus, Search } from "lucide-react";
import { taskApi } from "../../api/task.api";
import { orgApi } from "../../api/org.api";
import { queryKeys } from "../../api/queryKeys";
import TasksTriageBar from "./TasksTriageBar";
import PhaseAccordion from "./PhaseAccordion";
import CreateTaskModal from "./modals/CreateTaskModal";
import TaskDetailsModal from "./modals/TaskDetailsModal";

const EMPTY_LIST = [];

const TasksTab = ({ orgId, projectId, phases = [], onRefresh }) => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeKpiFilter, setActiveKpiFilter] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(orgId, projectId),
    queryFn: async () => {
      const response = await taskApi.getByProject(orgId, projectId);
      return response.data?.tasks || [];
    },
    enabled: Boolean(orgId && projectId),
    staleTime: 20_000,
  });

  const membersQuery = useQuery({
    queryKey: queryKeys.members(orgId),
    queryFn: async () => {
      const response = await orgApi.getMembers(orgId);
      return response.data?.members || [];
    },
    enabled: Boolean(orgId),
    staleTime: 45_000,
  });

  const tasks = tasksQuery.data ?? EMPTY_LIST;
  const members = membersQuery.data ?? EMPTY_LIST;
  const loading = tasksQuery.isPending;
  const error = tasksQuery.error;
  const sortedPhases = useMemo(
    () =>
      [...phases].sort(
        (a, b) =>
          (a?.startDate ? new Date(a.startDate).getTime() : 0) -
          (b?.startDate ? new Date(b.startDate).getTime() : 0)
      ),
    [phases]
  );

  const refreshData = async () => {
    await Promise.all([tasksQuery.refetch(), membersQuery.refetch()]);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const taskKey = queryKeys.tasks(orgId, projectId);
    const previousTasks = queryClient.getQueryData(taskKey) || tasks;

    queryClient.setQueryData(taskKey, (currentTasks = []) =>
      currentTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await taskApi.updateStatus(taskId, { status: newStatus });
    } catch (requestError) {
      queryClient.setQueryData(taskKey, previousTasks);
      alert(
        `Status update failed: ${
          requestError.response?.data?.message || requestError.message
        }`
      );
    }
  };

  const kpiMetrics = useMemo(() => {
    const now = new Date();
    return {
      overdueCount: tasks.filter(
        (task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) < now
      ).length,
      needsApprovalCount: tasks.filter((task) => task.status === "in_review").length,
      unassignedCount: tasks.filter((task) => !task.assignedTo).length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery || task.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === "all" || task.priority?.toLowerCase() === priorityFilter;
      const matchesKpi =
        activeKpiFilter === "overdue"
          ? task.status !== "done" && task.dueDate && new Date(task.dueDate) < now
          : activeKpiFilter === "needs_approval"
            ? task.status === "in_review"
            : activeKpiFilter === "unassigned"
              ? !task.assignedTo
              : true;
      return matchesSearch && matchesPriority && matchesKpi;
    });
  }, [activeKpiFilter, priorityFilter, searchQuery, tasks]);

  const { phaseGroupedTasks, floatingTasks } = useMemo(() => {
    const phaseMap = Object.fromEntries(sortedPhases.map((phase) => [phase._id, []]));
    const unallocated = [];
    filteredTasks.forEach((task) => {
      if (task.phase && phaseMap[task.phase]) phaseMap[task.phase].push(task);
      else unallocated.push(task);
    });
    return { phaseGroupedTasks: phaseMap, floatingTasks: unallocated };
  }, [filteredTasks, sortedPhases]);

  const sortByDueDate = (items) =>
    [...items].sort(
      (a, b) =>
        (a?.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
        (b?.dueDate ? new Date(b.dueDate).getTime() : Infinity)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-orange-500" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error.response?.data?.message || error.message || "Failed to fetch tasks."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TasksTriageBar
        kpiMetrics={kpiMetrics}
        activeFilter={activeKpiFilter}
        onSelectFilter={setActiveKpiFilter}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search task title..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSelectedPhaseId(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPhases.map((phase) => (
          <PhaseAccordion
            key={phase._id}
            phase={phase}
            tasks={sortByDueDate(phaseGroupedTasks[phase._id] || [])}
            onStatusChange={handleStatusChange}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setIsDetailsModalOpen(true);
            }}
            onAddTaskClick={(phaseId) => {
              setSelectedPhaseId(phaseId);
              setIsCreateModalOpen(true);
            }}
          />
        ))}
        {floatingTasks.length > 0 && (
          <PhaseAccordion
            key="unscheduled-floating"
            phase={null}
            tasks={sortByDueDate(floatingTasks)}
            onStatusChange={handleStatusChange}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setIsDetailsModalOpen(true);
            }}
            onAddTaskClick={(phaseId) => {
              setSelectedPhaseId(phaseId);
              setIsCreateModalOpen(true);
            }}
          />
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        orgId={orgId}
        projectId={projectId}
        phases={sortedPhases}
        members={members}
        initialPhaseId={selectedPhaseId}
        onTaskCreated={refreshData}
      />
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
        orgId={orgId}
        projectId={projectId}
        phases={sortedPhases}
        members={members}
        onTaskUpdated={refreshData}
        onTaskDeleted={() => onRefresh?.()}
      />
    </div>
  );
};

export default TasksTab;
