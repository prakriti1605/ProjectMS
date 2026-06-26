// routes/task.routes.js

import express from "express";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

const router = express.Router();

// Create task
router.post("/", createTask);

// Get all tasks
router.get("/", getTasks);

// Get single task
router.get("/:taskId", getTaskById);

// Update task
router.patch("/:taskId", updateTask);

// Delete task
router.delete("/:taskId", deleteTask);

export default router;