import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Plus, Loader2, AlertCircle } from "lucide-react";
import TasksTriageBar from "./TasksTriageBar";
import PhaseAccordion from "./PhaseAccordion";
import CreateTaskModal from "./modals/CreateTaskModal";
import { taskApi } from "../../api/task.api";
import { orgApi } from "../../api/org.api"; 
import TaskDetailsModal from "./modals/TaskDetailsModal";
/**
 * TasksTab - Modular tab container that manages tasks, triaging, and task creation internally.
 */
const TasksTab = ({
  orgId, 
  projectId, 
  phases = [], 
  onOpenTaskDetailsModal 
}) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeKpiFilter, setActiveKpiFilter] = useState(null); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => {
      const dateA = a?.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b?.startDate ? new Date(b.startDate).getTime() : 0;
      return dateA - dateB;
    });
  }, [phases]);

  // 1. Fetch All Tasks & Organisation Members
  const fetchData = async () => {
    if (!orgId || !projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch tasks and members in parallel using correct method names
      const [taskRes, memberRes] = await Promise.all([
        taskApi.getByProject(orgId, projectId),
        orgApi.getMembers(orgId).catch((err) => { // 👈 Using getMembers
          console.warn("Could not load members for modal dropdown:", err);
          return { data: { members: [] } };
        })
      ]);
      
      setTasks(taskRes.data?.tasks || []);
      setMembers(memberRes.data?.members || []);
    } catch (err) {
      console.error("Error fetching tasks tab data:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, projectId]);

  const handleOpenTaskDetailsModal = (task) => {
    console.log("=== DEBUG: Task clicked ===", task);
  setSelectedTask(task);
  setIsDetailsModalOpen(true);
};
  // Modal Handlers
  const handleOpenCreateModal = (phaseId = null) => {
    setSelectedPhaseId(phaseId);
    setIsCreateModalOpen(true);
  };

  // 2. Handle Task Status Updates
  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskApi.updateStatus(taskId, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      setTasks(previousTasks);
      alert(`Status update failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // 3. Compute KPI Metrics
  const kpiMetrics = useMemo(() => {
    const now = new Date();

    const overdueCount = tasks.filter(
      (t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const needsApprovalCount = tasks.filter(
      (t) => t.status === "in_review"
    ).length;

    const unassignedCount = tasks.filter(
      (t) => !t.assignedTo
    ).length;

    return { overdueCount, needsApprovalCount, unassignedCount };
  }, [tasks]);

  // 4. Filter Tasks (Search + Priority + KPI Toggle)
  const filteredTasks = useMemo(() => {
    const now = new Date();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority?.toLowerCase() === priorityFilter.toLowerCase();

      let matchesKpi = true;
      if (activeKpiFilter === "overdue") {
        matchesKpi = task.status !== "done" && task.dueDate && new Date(task.dueDate) < now;
      } else if (activeKpiFilter === "needs_approval") {
        matchesKpi = task.status === "in_review";
      } else if (activeKpiFilter === "unassigned") {
        matchesKpi = !task.assignedTo;
      }

      return matchesSearch && matchesPriority && matchesKpi;
    });
  }, [tasks, searchQuery, priorityFilter, activeKpiFilter]);

  // 5. Group Filtered Tasks into Phases vs Floating
  const { phaseGroupedTasks, floatingTasks } = useMemo(() => {
    const phaseMap = {};
    const unallocated = [];

    phases.forEach((p) => {
      phaseMap[p._id] = [];
    });

    filteredTasks.forEach((task) => {
      if (task.phase && phaseMap[task.phase]) {
        phaseMap[task.phase].push(task);
      } else {
        unallocated.push(task);
      }
    });

    return { phaseGroupedTasks: phaseMap, floatingTasks: unallocated };
  }, [filteredTasks, phases]);

  const handleTaskDeleted = (deletedTaskId) => {
    // 1. Instant UI update: Filter out the deleted task from local array
    setTasks((prevTasks) => prevTasks.filter((t) => t._id !== deletedTaskId));

    // 2. Re-fetch fresh dataset from backend
    if (onRefresh) {
      onRefresh();
    }
  };

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
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Triage Bar */}
      <TasksTriageBar
        kpiMetrics={kpiMetrics}
        activeFilter={activeKpiFilter}
        onSelectFilter={setActiveKpiFilter}
      />

      {/* 2. Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task title..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Priority Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => handleOpenCreateModal(null)}
            className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Accordion List Container */}
      <div className="space-y-4">
        {/* 1. Phase Accordions (Sorted chronologically by startDate) */}
        {sortedPhases.map((phase) => {
          // Extract & sort tasks for this phase chronologically by dueDate
          const rawPhaseTasks = phaseGroupedTasks[phase._id] || [];
          const sortedPhaseTasks = [...rawPhaseTasks].sort((a, b) => {
            const dateA = a?.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b?.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
          });

          return (
            <PhaseAccordion
              key={phase._id}
              phase={phase}
              tasks={sortedPhaseTasks}
              onStatusChange={handleStatusChange}
              onTaskClick={handleOpenTaskDetailsModal}
              onAddTaskClick={handleOpenCreateModal}
            />
          );
        })}

        {/* 2. Unscheduled / Floating Tasks Accordion (Sorted by dueDate) */}
        {floatingTasks.length > 0 && (
          <PhaseAccordion
            key="unscheduled-floating"
            phase={null}
            tasks={[...floatingTasks].sort((a, b) => {
              const dateA = a?.dueDate ? new Date(a.dueDate).getTime() : Infinity;
              const dateB = b?.dueDate ? new Date(b.dueDate).getTime() : Infinity;
              return dateA - dateB;
            })}
            onStatusChange={handleStatusChange}
            onTaskClick={handleOpenTaskDetailsModal}
            onAddTaskClick={handleOpenCreateModal}
          />
        )}
      </div>

      {/* 3. Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        orgId={orgId}
        projectId={projectId}
        phases={sortedPhases}
        members={members}
        initialPhaseId={selectedPhaseId}
        onTaskCreated={fetchData}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
        orgId={orgId}
        projectId={projectId}
        phases={sortedPhases} // 👈 Updated to sortedPhases for chronological dropdown options
        members={members}
        onTaskUpdated={fetchData}
        onTaskDeleted={fetchData}
      />
    </div>
  );
};

export default TasksTab;