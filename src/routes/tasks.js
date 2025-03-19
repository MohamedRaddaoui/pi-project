const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { validateTask, validateObjectId } = require("../middlewares/validation");

// Create a task
router.post("/", validateTask, taskController.createTask);

// Get all tasks
router.get("/", taskController.getAllTasks);

// Get a single task by ID
router.get("/:id", validateObjectId, taskController.getTaskById);

// Update a task
router.put("/:id", validateObjectId, validateTask, taskController.updateTask);

// Delete a task
router.delete("/:id", validateObjectId, taskController.deleteTask);

module.exports = router;
