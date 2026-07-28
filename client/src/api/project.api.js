import api from "./axios";

export const projectApi = {
  getByOrg: (orgId) =>
    api.get(`/projects/${orgId}`),

  create: (orgId, data) =>
    api.post(`/projects/${orgId}`, data),

  getById: (orgId, projectId) =>
    api.get(
      `/projects/${orgId}/${projectId}`
    ),

  update: (orgId, projectId, data) =>
    api.patch(
      `/projects/${orgId}/${projectId}`,
      data
    ),

  delete: (orgId, projectId) =>
    api.delete(
      `/projects/${orgId}/${projectId}`
    ),
};