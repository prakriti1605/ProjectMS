import api from "./axios";

export const taskApi = {
  getMyTasks: () =>
    api.get("/tasks/my"),

  getByProject: (orgId, projectId) =>
    api.get(`/tasks/${orgId}/${projectId}`),

  create: (orgId, projectId, data) =>
    api.post(
      `/tasks/${orgId}/${projectId}`,
      data
    ),

  update: (orgId, projectId, taskId, data) =>
    api.patch(
      `/tasks/${orgId}/${projectId}/${taskId}`,
      data
    ),

  delete: (orgId, projectId, taskId) =>
    api.delete(
      `/tasks/${orgId}/${projectId}/${taskId}`
    ),
};