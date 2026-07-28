import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {checkOrganisationAccess} from "../middleware/org.middleware.js";
import {requirePermission} from "../middleware/permission.middleware.js";
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
} from "../controllers/organisation.controller.js";

const router = express.Router();

// all org routes are protected
router.use(protect);

// create organisation
router.post("/",protect,createOrg);

// get all organisations of logged-in user
router.get("/", protect, getMyOrgs);

// get single organisation
router.get("/:orgId", protect, checkOrganisationAccess, getOrgById);

// add member to organisation
router.post(
  "/:orgId/addMembers", 
  protect, 
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_INVITE),addMember);
//delete member from org 
router.delete(
  "/:orgId/members/:userId",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_REMOVE),
  removeMember
);
//change member role
router.patch(
  "/:orgId/members/:userId/role",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.MEMBER_UPDATE_PERMISSIONS),
  updateMemberRole
);

// router.patch(
//   "/:orgId/members/:userId/permissions",
//   protect,
//   checkOrganisationAccess,
//   requirePermission(PERMISSIONS.MEMBER_UPDATE_PERMISSIONS),
//   updateMemberPermissions
// );

router.patch(
  "/:orgId",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_UPDATE),
  updateOrganisation
);

router.delete(
  "/:orgId",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_DELETE),
  deleteOrganisation
);

router.post(
  "/:orgId/join-code",
  protect,
  checkOrganisationAccess,
  requirePermission(PERMISSIONS.ORG_JOIN_CODE_MANAGE),
  generateJoinCode
);

router.post(
  "/join",
  protect,
  joinOrganisationByCode
);
export default router;