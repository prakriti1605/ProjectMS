import api from "./axios";

export const projectApi = {
  getByOrg: (orgId) => api.get(`/projects/org/${orgId}`),

  getById: (arg1, arg2) => {
    const projectId = arg2 || arg1;
    const orgId = arg2 ? arg1 : null;
    return orgId 
      ? api.get(`/projects/${orgId}/${projectId}`)
      : api.get(`/projects/${projectId}`);
  },

  create: (orgId, data) => api.post(`/projects/${orgId}`, data),
  update: (orgId, projectId, data) => api.patch(`/projects/${orgId}/${projectId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),

  // Project Master Timeline Update
  updateTimeline: (orgId, projectId, dates) =>
    api.patch(`/projects/${orgId}/${projectId}/timeline`, dates),

  // Phase Endpoints
  createPhase: (orgId, projectId, data) =>
    api.post(`/projects/${orgId}/${projectId}/phases`, data),

  updatePhase: (orgId, projectId, phaseId, data) =>
    api.patch(`/projects/${orgId}/${projectId}/phases/${phaseId}`, data),

  deletePhase: (orgId, projectId, phaseId) =>
    api.delete(`/projects/${orgId}/${projectId}/phases/${phaseId}`),
};