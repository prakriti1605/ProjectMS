// routes/task.routes.js

import express from "express";

import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { checkProjectAccess } from "../middleware/project.middleware.js";
import { checkTaskAccess } from "../middleware/task.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../config/permission.js";

const router = express.Router();

// Create task
router.post(
  "/:orgId/:projectId",
  protect,
  checkProjectAccess,
  requirePermission(PERMISSIONS.TASK_CREATE),
  createTask
);
// Get all tasks
router.get(
  "/:orgId/:projectId",
  protect,
  checkProjectAccess,
  getTasksByProject
);

// Get single task
router.get(
  "/:orgId/:projectId/:taskId",
  protect,
  checkTaskAccess,
  getTaskById
);

// Update task
router.patch(
  "/:orgId/:projectId/:taskId",
  protect,
  checkTaskAccess,
  requirePermission(PERMISSIONS.TASK_UPDATE),
  updateTask
);

// Delete task
router.delete(
  "/:orgId/:projectId/:taskId",
  protect,
  checkTaskAccess,
  requirePermission(PERMISSIONS.TASK_DELETE),
  deleteTask
);

export default router;