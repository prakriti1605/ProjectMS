import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { taskApi } from "../api/task.api";

export default function TaskDetails() {
  const { orgId, projectId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await taskApi.getById(
        orgId,
        projectId,
        taskId
      );

      const updatedTasks = res.data.tasks || [];

console.log(
  "TASKS AFTER FETCH:",
  updatedTasks
);

setTasks(updatedTasks);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load task"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId || !projectId || !taskId) return;

    fetchTask();
  }, [orgId, projectId, taskId]);

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading task...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-muted-foreground">
        Task not found
      </div>
    );
  }

  return (
    <div>

      {/* Back to Project */}

      <button
        onClick={() =>
          navigate(`/projects/${orgId}/${projectId}`)
        }
        className="
          text-muted-foreground
          hover:text-white
          mb-6
          transition
        "
      >
        ← Back to Project
      </button>

      {/* Task Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-semibold text-white">
          {task.title}
        </h1>

        <p className="text-muted-foreground mt-3">
          {task.description || "No description"}
        </p>

      </div>

      {/* Task Information */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">

        {/* Status */}

        <div className="bg-card border border-border rounded-xl p-5">

          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="text-white mt-2">
            {task.status || "Todo"}
          </p>

        </div>

        {/* Priority */}

        <div className="bg-card border border-border rounded-xl p-5">

          <p className="text-sm text-muted-foreground">
            Priority
          </p>

          <p className="text-white mt-2">
            {task.priority || "Medium"}
          </p>

        </div>

        {/* Assigned To */}

        <div className="bg-card border border-border rounded-xl p-5">

          <p className="text-sm text-muted-foreground">
            Assigned To
          </p>

          <p className="text-white mt-2">
            {task.assignedTo?task.assignedTo.username: "Unassigned"}</p>
            
          {task.assignedTo?.email && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.assignedTo.email}
            </p>
          )}

        </div>

        {/* Created By */}

        <div className="bg-card border border-border rounded-xl p-5">

          <p className="text-sm text-muted-foreground">
            Created By
          </p>

          <p className="text-white mt-2">
            {task.createdBy?.username || "Unknown"}
          </p>

          {task.createdBy?.email && (
            <p className="text-sm text-muted-foreground mt-1">
              {task.createdBy.email}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}