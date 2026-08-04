import api from "./axios";

export const orgApi = {
  create: (name) => 
    api.post("/org", { name }),

  getAll: () => 
    api.get("/org"),

  getById: (orgId) => 
    api.get(`/org/${orgId}`),

  update: (orgId, data) => 
    api.patch(`/org/${orgId}`, data),

  delete: (orgId) => 
    api.delete(`/org/${orgId}`),

  updateMemberRole: (orgId, userId, role) =>
    api.patch(
      `/org/${orgId}/members/${userId}/role`, 
      { role }
    ),

  // Granular Member Permissions API
  updateMemberPermissions: (orgId, userId, permissions) =>
    api.patch(
      `/org/${orgId}/members/${userId}/permissions`, 
      { permissions }
    ),

  removeMember: (orgId, userId) =>
    api.delete(
      `/org/${orgId}/members/${userId}`
    ),

  generateJoinCode: (orgId) =>
    api.post(`/org/${orgId}/join-code`),

  joinOrganisation: (joinCode) =>
    api.post("/org/join", { joinCode }),
};