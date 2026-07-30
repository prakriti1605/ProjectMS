import express from "express";
import { getOrganisationActivities } from "../controllers/activity.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkOrganisationAccess } from "../middleware/org.middleware.js";

const router = express.Router();

router.get(
  "/:orgId",
  protect,
  checkOrganisationAccess,
  getOrganisationActivities
);

export default router;