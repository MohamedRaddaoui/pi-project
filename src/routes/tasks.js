const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { validateTask, validateObjectId } = require("../middlewares/validation");

// Create a task
router.post("/create", validateTask, taskController.createTask);

// Get all tasks
router.get("/getAll/", taskController.getAllTasks);

// Get a single task by ID
router.get("/getbyId/:id", validateObjectId, taskController.getTaskById);

// Update a task
router.put("/update/:id", validateObjectId, validateTask, taskController.updateTask);

// Delete a task
router.delete("/delete/:id", validateObjectId, taskController.deleteTask);

module.exports = router;
