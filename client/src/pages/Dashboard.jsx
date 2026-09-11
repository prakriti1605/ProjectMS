import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Loader2 
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import { taskApi } from "../api/task.api";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organisations, loading: organisationsLoading } = useOrganisation();
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const userId = user?._id || user?.id;

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
  const loading = organisationsLoading || myTasksQuery.isPending;
  const orgCount = organisations.length;

  // Helper Calculations
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Urgent tasks: Status != done, sorted by Due Date ascending
  const urgentTasks = pendingTasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Quick Status Handler
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await taskApi.updateStatus(taskId, { status: newStatus });
      queryClient.setQueryData(queryKeys.myTasks(userId), (currentTasks = []) =>
        currentTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getDueDateBadge = (dueDateStr) => {
    if (!dueDateStr) return null;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = dueDate < today;
    const dateFormatted = new Date(dueDateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md">
          <AlertTriangle className="w-3 h-3" /> Overdue ({dateFormatted})
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
        <Clock className="w-3 h-3" /> Due {dateFormatted}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-full max-w-7xl mx-auto space-y-4 overflow-hidden text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          Dashboard <span className="text-orange-500">.</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Overview of your organizations, upcoming work, and task progress.
        </p>
      </div>

      {/* 4 KPI Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Organisations"
          value={orgCount}
          icon={Building2}
          color="orange"
          subtitle="Active Workspaces"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon={Clock}
          color="amber"
          subtitle="Action Required"
        />
        <StatCard
          title="Urgent / Due Soon"
          value={urgentTasks.length}
          icon={AlertTriangle}
          color="rose"
          subtitle="High Priority"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${completedTasks.length} of ${totalTasks} Done`}
        />
      </div>

      {/* Urgent Action Table Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-border flex justify-between items-center bg-card">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Urgent & Priority Action List
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change status directly to update metrics instantly.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg">
            {urgentTasks.length} Urgent Tasks
          </span>
        </div>

        <div className="divide-y divide-border">
          {urgentTasks.length === 0 ? (
            <div className="p-5 text-center text-muted-foreground text-sm">
              🎉 No urgent tasks due! You're all caught up.
            </div>
          ) : (
            urgentTasks.map((task) => (
              <div
                key={task._id}
                className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">
                      {task.title}
                    </h3>
                    {getDueDateBadge(task.dueDate)}
                  </div>
                  {task.project && (
                    <p className="text-xs text-muted-foreground">
                      Project:{" "}
                      <span className="text-foreground font-medium">
                        {typeof task.project === "object" ? task.project.name : "Active Project"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={task.status}
                    disabled={updatingTaskId === task._id}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="text-xs font-semibold bg-secondary text-foreground border border-border rounded-lg px-3 py-1.5 focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="todo">🔴 To Do</option>
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="done">🟢 Done</option>
                  </select>

                  {updatingTaskId === task._id && (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
