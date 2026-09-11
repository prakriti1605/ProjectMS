import OrganisationMember from "../models/organisationMember.model.js";

export const checkOrganisationAccess = async (req, res, next) => {
  try {
    // Read orgId safely from params, body, or headers
    const orgId = req.params.orgId || req.body.orgId || req.headers["x-org-id"];
    const userId = req.user?._id || req.user?.id;

    if (!orgId) {
      return res.status(400).json({ message: "Organisation ID missing in request" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Query using OrganisationMember model
    const member = await OrganisationMember.findOne({
      organisation: orgId,
      user: userId,
    });

    if (!member) {
      return res.status(403).json({
        message: "Forbidden: You are not a member of this organisation",
      });
    }

    // ✅ Attach member context for requirePermission middleware
    req.org = { _id: orgId };
    req.member = member;

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};