import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkOrganisationAccess } from "../middleware/org.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../config/permission.js";

import {
  getProjectsByOrg,
  getProjectById,
  createProject,
  updateProject,
  updateProjectTimeline,
  createPhase,
  updatePhase,
  deletePhase,
} from "../controllers/project.controller.js";

const router = express.Router();

router.use(protect);

// 1. Specific Org Projects List Route (MUST be above generic /:projectId routes)
router.get("/org/:orgId", checkOrganisationAccess, getProjectsByOrg);

// 2. Timeline Patch Route
router.patch(
  "/:orgId/:projectId/timeline",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  updateProjectTimeline
);

// 3. Phase Operations Routes
router.post(
  "/:orgId/:projectId/phases",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  createPhase
);

router.patch(
  "/:orgId/:projectId/phases/:phaseId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  updatePhase
);

router.delete(
  "/:orgId/:projectId/phases/:phaseId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  deletePhase
);

// 4. Create Project
router.post(
  "/:orgId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_CREATE),
  createProject
);

// 5. Update Project Details
router.patch(
  "/:orgId/:projectId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.PROJECT_UPDATE),
  updateProject
);

// 6. Get Single Project Details Route
// (checkOrganisationAccess sets req.org which getProjectById requires for req.org._id)
router.get("/:orgId/:projectId", checkOrganisationAccess, getProjectById);

export default router;