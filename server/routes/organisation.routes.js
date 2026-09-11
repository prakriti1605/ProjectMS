import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkOrganisationAccess } from "../middleware/org.middleware.js";
import { requirePermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../config/permission.js";

import {
  createOrg,
  getMyOrgs,
  getOrgById,
  addMember,
  removeMember,
  updateMemberRole,
  updateOrganisation,
  deleteOrganisation,
  generateJoinCode,
  joinOrganisationByCode,
  getOrgMembers,
} from "../controllers/organisation.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrg);

router.get("/", 
  protect,
  getMyOrgs);

router.get("/:orgId", 
  checkOrganisationAccess, 
  getOrgById);

// --- GET ALL MEMBERS ROUTE (ADDED) ---
router.get("/:orgId/members",
  checkOrganisationAccess, 
  getOrgMembers);

// add member
router.post(
  "/:orgId/addMembers", 
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_INVITE),
  addMember
);

// delete member 
router.delete(
  "/:orgId/members/:userId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_REMOVE),
  removeMember
);

// change member role
router.patch(
  "/:orgId/members/:userId/role",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_UPDATE_PERMISSIONS),
  updateMemberRole
);

router.patch(
  "/:orgId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_UPDATE),
  updateOrganisation
);

router.delete(
  "/:orgId",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_DELETE),
  deleteOrganisation
);

router.post(
  "/:orgId/join-code",
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_JOIN_CODE_MANAGE),
  generateJoinCode
);

router.post("/join", joinOrganisationByCode);

export default router;