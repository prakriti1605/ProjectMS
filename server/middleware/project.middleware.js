// server/middleware/project.middleware.js
import Project from "../models/project.model.js"; // Make sure Project model is imported!

export const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId, orgId } = req.params;

    // Use orgId from params or attached req.org
    const targetOrgId = orgId || req.org?._id;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Find the project in database
    const project = await Project.findOne({
      _id: projectId,
      organisation: targetOrgId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found in this organisation" });
    }

    // Attach project object to request for downstream controllers
    req.project = project;
    next();
  } catch (error) {
    console.error("checkProjectAccess Error:", error);
    return res.status(500).json({ message: error.message });
  }
};