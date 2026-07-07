import api from "./axios";

export const orgApi = {
  getAll: () => api.get("/org"),
  getById: (id) => api.get(`/org/${id}`),
};