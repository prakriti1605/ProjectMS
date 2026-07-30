import api from "./axios";

export const getOrganisationActivities = (orgId) => {
  return api.get(`/activity/${orgId}`);
};