
export const createProject = async (req, res) => {
    res.status(201).json({
        success: true,
        message: "Create project endpoint"
    });
};

export const getProjects = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Get all projects endpoint"
    });
};

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;

    res.status(200).json({
        success: true,
        message: "Get project by id endpoint",
        projectId
    });
};

export const updateProject = async (req, res) => {
    const { projectId } = req.params;

    res.status(200).json({
        success: true,
        message: "Update project endpoint",
        projectId
    });
};

export const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    res.status(200).json({
        success: true,
        message: "Delete project endpoint",
        projectId
    });
};