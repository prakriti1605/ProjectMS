// ye file ye bata rahi hai ki humare pass kaun kaun si permissions hai. Mtlb suppose owner khud ki ek permission bana de "allow_everything". Toh ab ye valid thodi hoga.

export const PERMISSIONS = {

    // Project
    PROJECT_CREATE: "project:create",
    PROJECT_UPDATE: "project:update",
    PROJECT_DELETE: "project:delete",

    // Task
    TASK_CREATE: "task:create",
    TASK_UPDATE: "task:update",
    TASK_DELETE: "task:delete",

    // Member
    MEMBER_INVITE: "member:invite",
    MEMBER_REMOVE: "member:remove",
    MEMBER_UPDATE_PERMISSIONS: "member:updatePermissions",

    // Organisation
    ORG_UPDATE: "org:update",
    ORG_DELETE: "org:delete"
};