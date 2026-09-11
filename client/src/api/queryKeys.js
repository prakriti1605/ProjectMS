export const queryKeys = {
  organisations: (userId) => ["organisations", userId],
  organisation: (organisationId) => ["organisation", organisationId],
  members: (organisationId) => ["organisation-members", organisationId],
  projects: (organisationId) => ["projects", organisationId],
  project: (organisationId, projectId) => ["project", organisationId, projectId],
  tasks: (organisationId, projectId) => ["project-tasks", organisationId, projectId],
  myTasks: (userId) => ["my-tasks", userId],
  activity: (organisationId) => ["organisation-activity", organisationId],
};
