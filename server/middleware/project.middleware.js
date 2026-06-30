import Project from "../models/project.model.js";
import Organisation from "../models/organisation.model.js";

export const checkProjectAccess = async (req, res, next) => {
    console.log("Project ID:", req.params.projectId);

    const project = await Project.findById(req.params.projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }

    const org = await Organisation.findById(project.organisation);
    console.log("Organisation:", org);
    const member = org.members.find(m =>
        m.user.equals(req.user._id)
    );

    if (!member) {
        return res.status(403).json({ message: "Not a member" });
    }
    console.log("Member:", member);

    req.project = project;
    req.org = org;
    req.member = member;

    next();
};