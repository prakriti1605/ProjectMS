import client from "./client";


export const getDashboardStats = (orgId) => {
  return client.get(`/dashboard/${orgId}/stats`);
};