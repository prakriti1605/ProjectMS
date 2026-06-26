// controllers/task.controller.js

export const createTask = async (req, res) => {
    res.status(201).json({
        success: true,
        message: "Create task endpoint",
        body: req.body
    });
};

export const getTasks = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Get all tasks endpoint"
    });
};

export const getTaskById = async (req, res) => {
    const { taskId } = req.params;

    res.status(200).json({
        success: true,
        message: "Get task by id endpoint",
        taskId
    });
};

export const updateTask = async (req, res) => {
    const { taskId } = req.params;

    res.status(200).json({
        success: true,
        message: "Update task endpoint",
        taskId,
        body: req.body
    });
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;

    res.status(200).json({
        success: true,
        message: "Delete task endpoint",
        taskId
    });
};