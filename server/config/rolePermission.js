// // ye file batayegi ki kaun se role ke pass kaun si permission hai. 
// You would ask ki roles banane hi kyun hai jab hum permission se hi access karenge controllers. It is because initially it will tell ki suppose A is admin and these are the default permissions he have. After that if owner wants to change the permissions of his adin A, he can do that. And it will not affect another admin's permission in anothe rproject.

import { PERMISSIONS } from "./permission.js";

export const DEFAULT_PERMISSIONS = {

    owner: [

        PERMISSIONS.PROJECT_CREATE,
        PERMISSIONS.PROJECT_UPDATE,
        PERMISSIONS.PROJECT_DELETE,

        PERMISSIONS.TASK_CREATE,
        PERMISSIONS.TASK_UPDATE,
        PERMISSIONS.TASK_DELETE,

        PERMISSIONS.MEMBER_INVITE,
        PERMISSIONS.MEMBER_REMOVE,
        PERMISSIONS.MEMBER_UPDATE_PERMISSIONS,

        PERMISSIONS.ORG_UPDATE,
        PERMISSIONS.ORG_DELETE,

        PERMISSIONS.ORG_JOIN_CODE_MANAGE
    ],

    admin: [

        PERMISSIONS.PROJECT_CREATE,
        PERMISSIONS.PROJECT_UPDATE,

        PERMISSIONS.TASK_CREATE,
        PERMISSIONS.TASK_UPDATE,
        PERMISSIONS.TASK_DELETE,

        PERMISSIONS.MEMBER_INVITE
    ],

    member: [

        // PERMISSIONS.TASK_CREATE,
        // PERMISSIONS.TASK_UPDATE
    ]
};