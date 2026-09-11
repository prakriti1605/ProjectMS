import Project from "../models/project.model.js";
import { logActivity } from "../utils/actvityLogger.js";
import { emitOrganisationEvent } from "../utils/socket.js";


// 1. Create Project (Updated with startDate & endDate)
export const createProject = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { name, description, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description: description || "",
      organisation: orgId,
      createdBy: req.user._id,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    emitOrganisationEvent({
      organisationId: orgId,
      event: "PROJECT_CREATED",
      payload: { project },
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 2. Update Project Details (Updated with startDate & endDate)
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;

    await project.save();

    emitOrganisationEvent({
      organisationId: project.organisation,
      event: "PROJECT_UPDATED",
      payload: { project },
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 3. Update Master Project Timeline Dates
// Helper to clean up stringified quotes around Mongo ObjectIds
const cleanId = (id) => (typeof id === "string" ? id.replace(/["']/g, "").trim() : id);

// Update Master Project Timeline
export const updateProjectTimeline = async (req, res) => {
  try {
    const projectId = cleanId(req.params.projectId);
    const { startDate, endDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;

    await project.save();

    emitOrganisationEvent({
      organisationId: project.organisation,
      event: "PROJECT_UPDATED",
      payload: { project },
    });

    return res.status(200).json({
      message: "Project timeline updated successfully",
      project,
    });
  } catch (error) {
    console.error("UPDATE TIMELINE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Create Phase
export const createPhase = async (req, res) => {
  try {
    const projectId = cleanId(req.params.projectId);
    const { name, startDate, endDate, description, isMilestone, status } = req.body;

    if (!name || !startDate) {
      return res.status(400).json({ message: "Phase name and start date are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newPhase = {
      name,
      startDate,
      endDate: endDate || null,
      description: description || "",
      isMilestone: isMilestone || false,
      status: status || "In Progress",
    };

    project.phases.push(newPhase);
    await project.save();

    return res.status(201).json({
      message: "Phase created successfully",
      phases: project.phases,
      phase: project.phases[project.phases.length - 1],
    });
  } catch (error) {
    console.error("CREATE PHASE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Phase
export const updatePhase = async (req, res) => {
  try {
    const projectId = cleanId(req.params.projectId);
    const phaseId = cleanId(req.params.phaseId);
    const { name, startDate, endDate, description, isMilestone, status, progress } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const phase = project.phases.id(phaseId);
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    if (name !== undefined) phase.name = name;
    if (startDate !== undefined) phase.startDate = startDate;
    if (endDate !== undefined) phase.endDate = endDate;
    if (description !== undefined) phase.description = description;
    if (isMilestone !== undefined) phase.isMilestone = isMilestone;
    if (status !== undefined) phase.status = status;
    if (progress !== undefined) phase.progress = progress;

    await project.save();

    return res.status(200).json({
      message: "Phase updated successfully",
      phases: project.phases,
      phase,
    });
  } catch (error) {
    console.error("UPDATE PHASE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete Phase
export const deletePhase = async (req, res) => {
  try {
    const projectId = cleanId(req.params.projectId);
    const phaseId = cleanId(req.params.phaseId);

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.phases = project.phases.filter((p) => p._id.toString() !== phaseId);
    await project.save();

    return res.status(200).json({
      message: "Phase deleted successfully",
      phases: project.phases,
    });
  } catch (error) {
    console.error("DELETE PHASE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects for an organisation
// @route   GET /api/projects/:orgId
// Fetch all projects for an organisation
export const getProjectsByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({ message: "Organisation ID is required" });
    }

    const projects = await Project.find({ organisation: orgId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Get a single project by orgId and projectId
// @route   GET /api/projects/:orgId/:projectId
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      organisation: req.org._id,
    }).populate("createdBy", "username email");

    if (!project) {
      return res.status(404).json({ message: "Project not found in this organisation." });
    }

    return res.json({ project, phases: project.phases || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

