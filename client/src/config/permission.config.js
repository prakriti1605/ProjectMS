// Paste your backend PERMISSIONS dictionary directly here
export const PERMISSIONS = {
  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",

  TASK_CREATE: "task:create",
  TASK_UPDATE_DETAILS: "task:updateDetails",
  TASK_UPDATE_STATUS: "task:updateStatus",
  TASK_UPDATE_ASSIGNEE: "task:updateAssignee",
  TASK_UPDATE_DUE_DATE: "task:updateDueDate",
  TASK_DELETE: "task:delete",

  MEMBER_INVITE: "member:invite",
  MEMBER_REMOVE: "member:remove",
  MEMBER_UPDATE_PERMISSIONS: "member:updatePermissions",

  ORG_UPDATE: "org:update",
  ORG_DELETE: "org:delete",
  ORG_JOIN_CODE_MANAGE: "org:joinCodeManage",
};

export const SYSTEM_PERMISSIONS = [
  {
    category: "Projects",
    items: [
      { key: PERMISSIONS.PROJECT_CREATE, label: "Create Projects", description: "Allows creating new projects" },
      { key: PERMISSIONS.PROJECT_UPDATE, label: "Update Projects", description: "Allows editing project settings and details" },
      { key: PERMISSIONS.PROJECT_DELETE, label: "Delete Projects", description: "Allows deleting existing projects" },
    ],
  },
  {
    category: "Tasks",
    items: [
      { key: PERMISSIONS.TASK_CREATE, label: "Create Tasks", description: "Allows creating new task items" },
      { key: PERMISSIONS.TASK_UPDATE_DETAILS, label: "Edit Task Details", description: "Allows updating task descriptions" },
      { key: PERMISSIONS.TASK_UPDATE_STATUS, label: "Update Task Status", description: "Allows changing task status" },
      { key: PERMISSIONS.TASK_UPDATE_ASSIGNEE, label: "Change Task Assignee", description: "Allows reassigning tasks" },
      { key: PERMISSIONS.TASK_UPDATE_DUE_DATE, label: "Update Due Dates", description: "Allows setting task deadlines" },
      { key: PERMISSIONS.TASK_DELETE, label: "Delete Tasks", description: "Allows deleting tasks" },
    ],
  },
  {
    category: "Members & Access",
    items: [
      { key: PERMISSIONS.MEMBER_INVITE, label: "Invite Members", description: "Allows inviting new users to the org" },
      { key: PERMISSIONS.MEMBER_REMOVE, label: "Remove Members", description: "Allows removing users from the org" },
      { key: PERMISSIONS.MEMBER_UPDATE_PERMISSIONS, label: "Manage Permissions", description: "Allows editing member permissions" },
    ],
  },
  {
    category: "Organisation Settings",
    items: [
      { key: PERMISSIONS.ORG_UPDATE, label: "Update Organisation", description: "Allows changing org name/details" },
      { key: PERMISSIONS.ORG_DELETE, label: "Delete Organisation", description: "Allows deleting the organisation" },
      { key: PERMISSIONS.ORG_JOIN_CODE_MANAGE, label: "Manage Join Codes", description: "Allows generating and invalidating join codes" },
    ],
  },
];