import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarDays, CheckCircle2, ListTodo } from "lucide-react";
import { taskApi } from "../api/task.api";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import TaskDetailsModal from "../components/tasks/modals/TaskDetailsModal";

const filters = [
  { id: "all", label: "All" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "overdue", label: "Overdue" },
];

const isCompleted = (task) => task.status === "done" || task.status === "completed";

const formatStatus = (status) =>
  (status || "todo").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDueDate = (dueDate) => {
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function MyTasks() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [activeFilter, setActiveFilter] = useState("all");
  const [organisationFilter, setOrganisationFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const myTasksQuery = useQuery({
    queryKey: queryKeys.myTasks(userId),
    queryFn: async () => {
      const response = await taskApi.getMyTasks();
      return response.data?.tasks || [];
    },
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const tasks = myTasksQuery.data || [];

  const organisations = useMemo(() => {
    const uniqueOrganisations = new Map();
    tasks.forEach((task) => {
      if (task.organisation?._id) {
        uniqueOrganisations.set(task.organisation._id, task.organisation);
      }
    });
    return [...uniqueOrganisations.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const projects = useMemo(() => {
    const uniqueProjects = new Map();
    tasks.forEach((task) => {
      const taskOrganisationId = task.organisation?._id;
      if (
        task.project?._id &&
        (organisationFilter === "all" || taskOrganisationId === organisationFilter)
      ) {
        uniqueProjects.set(task.project._id, task.project);
      }
    });
    return [...uniqueProjects.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [organisationFilter, tasks]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = (task) =>
      !isCompleted(task) && task.dueDate && new Date(task.dueDate) < today;

    return [...tasks]
      .filter((task) => {
        if (
          organisationFilter !== "all" &&
          task.organisation?._id !== organisationFilter
        ) {
          return false;
        }
        if (projectFilter !== "all" && task.project?._id !== projectFilter) {
          return false;
        }
        if (activeFilter === "all") return true;
        if (activeFilter === "completed") return isCompleted(task);
        if (activeFilter === "overdue") return isOverdue(task);
        return task.status === activeFilter;
      })
      .sort((a, b) => {
        const completionDifference = Number(isCompleted(a)) - Number(isCompleted(b));
        if (completionDifference !== 0) return completionDifference;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  }, [activeFilter, organisationFilter, projectFilter, tasks]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (myTasksQuery.isPending) {
    return <div className="p-6 text-muted-foreground">Loading your tasks...</div>;
  }

  if (myTasksQuery.isError) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-400">
        <AlertCircle className="h-5 w-5" />
        {myTasksQuery.error?.response?.data?.message || "Failed to load your tasks."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ListTodo className="h-6 w-6 text-primary" /> My Tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tasks currently assigned to you, ordered by due date.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={organisationFilter}
          onChange={(event) => {
            setOrganisationFilter(event.target.value);
            setProjectFilter("all");
          }}
          className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="all">All organisations</option>
          {organisations.map((organisation) => (
            <option key={organisation._id} value={organisation._id}>
              {organisation.name}
            </option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="all">All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No tasks match this filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filteredTasks.map((task) => {
            const overdue =
              !isCompleted(task) && task.dueDate && new Date(task.dueDate) < today;

            return (
              <button
                key={task._id}
                type="button"
                onClick={() => setSelectedTask(task)}
                className="flex w-full flex-col gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-secondary/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h2 className={`font-semibold ${isCompleted(task) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {task.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.organisation?.name || "Organisation unavailable"}
                    {" · "}
                    {task.project?.name || "Project unavailable"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-border bg-secondary px-2.5 py-1 font-medium capitalize text-foreground">
                    {formatStatus(task.status)}
                  </span>
                  <span className="rounded-md border border-border px-2.5 py-1 font-medium capitalize text-muted-foreground">
                    {task.priority || "medium"}
                  </span>
                  <span className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${overdue ? "bg-red-500/10 text-red-400" : "bg-secondary text-muted-foreground"}`}>
                    {overdue ? <AlertCircle className="h-3.5 w-3.5" /> : isCompleted(task) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                    {overdue ? `Overdue · ${formatDueDate(task.dueDate)}` : formatDueDate(task.dueDate)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <TaskDetailsModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        orgId={selectedTask?.organisation?._id}
        projectId={selectedTask?.project?._id}
        statusOnly
        onTaskUpdated={() => myTasksQuery.refetch()}
      />
    </div>
  );
}
