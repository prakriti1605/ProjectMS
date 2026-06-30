import express from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { checkOrganisationAccess } from "../middleware/org.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../config/permission.js";
import { checkProjectAccess } from "../middleware/project.middleware.js";

const router = express.Router();

router.post(
  "/:orgId",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_CREATE),
  createProject
);

router.get(
  "/:orgId",
  protect,
  checkOrganisationAccess,
  getProjects
);

router.get(
  "/:orgId/:projectId",
  protect,
  checkProjectAccess,
  getProjectById
);

router.patch(
  "/:orgId/:projectId",
  protect,
  checkProjectAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  updateProject
);

router.delete(
  "/:orgId/:projectId",
  protect,
  checkProjectAccess,
  requirePermission(PERMISSIONS.PROJECT_DELETE),
  deleteProject
);

export default router;