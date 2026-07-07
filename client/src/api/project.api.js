import api from "./axios";

export const projectApi = {
  getByOrg: (orgId) => api.get(`/projects/${orgId}`),
};