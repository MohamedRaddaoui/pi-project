const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskRoutes = require("./tasks");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);
// Use Project routes
router.use("/project", projectRoutes);

module.exports = router;
// Use tasks routes
router.use("/tasks", taskRoutes);

module.exports = router;
