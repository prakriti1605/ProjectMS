import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkOrganisationAccess } from "../middleware/org.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";


const router = express.Router();


router.get(
  "/:orgId/stats",
  protect,
  checkOrganisationAccess,
  getDashboardStats
);


export default router;