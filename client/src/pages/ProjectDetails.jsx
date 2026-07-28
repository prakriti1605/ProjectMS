import { useEffect, useState } from "react";
import {
useParams,
useNavigate,
} from "react-router-dom";

import ProjectHeader from "../components/project/ProjectHeader";
import TaskList from "../components/tasks/TaskList";
import TaskDetailsModal from "../components/tasks/taskDetailsModal";
import EditTaskModal from "../components/tasks/EditTaskModal";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import ProjectSettingsModal from "../components/project/ProjectSettingsModal";

import { orgApi } from "../api/org.api";
import { projectApi } from "../api/project.api";
import { taskApi } from "../api/task.api";

export default function ProjectDetails() {
const { orgId, projectId } = useParams();
const navigate = useNavigate();

// =========================
// Project State
// =========================

const [project, setProject] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// =========================
// Task State
// =========================

const [tasks, setTasks] = useState([]);
const [selectedTask, setSelectedTask] =
useState(null);

// =========================
// Modal State
// =========================

const [showTaskDetails, setShowTaskDetails] =
useState(false);

const [showEditModal, setShowEditModal] =
useState(false);

const [showCreateModal, setShowCreateModal] =
useState(false);

const [showSettings, setShowSettings] =
useState(false);

// =========================
// Members
// =========================

const [members, setMembers] = useState([]);

// =========================
// Fetch Project
// =========================

const fetchProject = async () => {
try {
setLoading(true);

  const res = await projectApi.getById(
    orgId,
    projectId
  );

  setProject(res.data.project);
} catch (err) {
  console.error(
    "Failed to load project:",
    err
  );

  setError("Failed to load project");
} finally {
  setLoading(false);
}

};

// =========================
// Fetch Tasks
// =========================

const fetchTasks = async () => {
try {
const res =
await taskApi.getByProject(
orgId,
projectId
);

  setTasks(res.data.tasks || []);
} catch (err) {
  console.error(
    "Failed to load tasks:",
    err
  );
}

};

// =========================
// Fetch Members
// =========================

const fetchMembers = async () => {
try {
const res =
await orgApi.getById(orgId);

  setMembers(
    res.data.members || []
  );
} catch (err) {
  console.error(
    "Failed to load members:",
    err
  );
}

};

// =========================
// Initial Data Fetch
// =========================

useEffect(() => {
fetchProject();
fetchTasks();
fetchMembers();
}, [orgId, projectId]);

// =========================
// Task Handlers
// =========================

const handleSelectTask = (task) => {
setSelectedTask(task);
setShowTaskDetails(true);
};

const handleCloseTaskDetails = () => {
setSelectedTask(null);
setShowTaskDetails(false);
};

const handleCreateTask = () => {
setShowCreateModal(true);
};

const handleCreateTaskSubmit = async (data) => {
try {
await taskApi.create(
orgId,
projectId,
data
);

  setShowCreateModal(false);

  await fetchTasks();
} catch (err) {
  console.error(
    "Failed to create task:",
    err
  );

  alert(
    err.response?.data?.message ||
      "Failed to create task"
  );
}

};

const handleEditTask = (task) => {
setSelectedTask(task);
setShowTaskDetails(false);
setShowEditModal(true);
};

const handleUpdateTask = async (data) => {
try {
await taskApi.update(
orgId,
projectId,
selectedTask._id,
data
);

  setShowEditModal(false);
  setShowTaskDetails(false);

  await fetchTasks();
} catch (err) {
  console.error(
    "Failed to update task:",
    err
  );
}

};

const handleDeleteTask = async (task) => {
// Optimistic UI update
setTasks((prev) =>
prev.filter(
(t) => t._id !== task._id
)
);

setShowTaskDetails(false);

try {
  await taskApi.delete(
    orgId,
    projectId,
    task._id
  );
} catch (err) {
  console.error(
    "Failed to delete task:",
    err
  );

  // Restore actual server state
  try {
    const res =
      await taskApi.getByProject(
        orgId,
        projectId
      );

    setTasks(
      res.data.tasks || []
    );
  } catch (fetchErr) {
    console.error(
      "Failed to refetch tasks:",
      fetchErr
    );
  }
}

};

// =========================
// Project Settings Handlers
// =========================

const handleUpdateProject = async (
data
) => {
try {
const res =
await projectApi.update(
orgId,
projectId,
data
);

  setProject(
    res.data.project
  );

  setShowSettings(false);
} catch (err) {
  console.error(
    "Failed to update project:",
    err
  );

  throw err;
}

};

const handleDeleteProject = async () => {
try {
await projectApi.delete(
orgId,
projectId
);

  navigate(`/org/${orgId}`);
} catch (err) {
  console.error(
    "Failed to delete project:",
    err
  );

  throw err;
}

};

// =========================
// Loading State
// =========================

if (loading) {
return (
<div className="p-6 text-gray-400">
Loading project...
</div>
);
}

// =========================
// Error State
// =========================

if (error) {
return (
<div className="p-6 text-red-400">
{error}
</div>
);
}

// =========================
// Page
// =========================

return (
<div className="p-6">

  {/* Project Header */}

  <ProjectHeader
    project={project}
    orgId={orgId}
    onSettings={() =>
      setShowSettings(true)
    }
  />


  {/* Tasks */}

  <TaskList
    tasks={tasks}
    onCreateTask={
      handleCreateTask
    }
    onSelectTask={
      handleSelectTask
    }
  />


  {/* Create Task Modal */}

  <CreateTaskModal
    open={showCreateModal}
    members={members}
    onClose={() =>
      setShowCreateModal(false)
    }
    onCreate={
      handleCreateTaskSubmit
    }
  />


  {/* Task Details Modal */}

  <TaskDetailsModal
    task={selectedTask}
    open={showTaskDetails}
    onClose={
      handleCloseTaskDetails
    }
    onEdit={handleEditTask}
    onDelete={handleDeleteTask}
  />


  {/* Edit Task Modal */}

  <EditTaskModal
    open={showEditModal}
    task={selectedTask}
    members={members}
    onClose={() =>
      setShowEditModal(false)
    }
    onUpdate={handleUpdateTask}
  />


  {/* Project Settings Modal */}

  <ProjectSettingsModal
    open={showSettings}
    project={project}
    onClose={() =>
      setShowSettings(false)
    }
    onUpdate={
      handleUpdateProject
    }
    onDelete={
      handleDeleteProject
    }
  />

</div>

);
}