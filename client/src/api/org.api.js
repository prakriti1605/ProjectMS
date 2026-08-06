// src/api/org.api.js
import api from "./axios";

export const orgApi = {
  create: (name) => api.post("/org", { name }),
  getAll: () => api.get("/org"),
  getById: (id) => api.get(`/org/${id}`),
  joinOrganisation: (joinCode) => api.post("/org/join", { joinCode }),

  // Join Code endpoint
  generateJoinCode: (orgId) => api.post(`/org/${orgId}/join-code`),

  // Members API endpoints
  getMembers: (orgId) => api.get(`/org/${orgId}/members`),
  updateMemberRole: (orgId, userId, role) =>
    api.patch(`/org/${orgId}/members/${userId}/role`, { role }),
  removeMember: (orgId, userId) =>
    api.delete(`/org/${orgId}/members/${userId}`),
};