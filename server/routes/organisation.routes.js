import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  createOrg,
  getMyOrgs,
  getOrgById,
  addMember,
} from "../controllers/organisation.controller.js";

const router = express.Router();

// all org routes are protected
router.use(protect);

// create organisation
router.post("/", createOrg);

// get all organisations of logged-in user
router.get("/", getMyOrgs);

// get single organisation
router.get("/:id", getOrgById);

// add member to organisation
router.post("/:id/members", addMember);

export default router;