const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskRoutes = require("./Task/tasks");
const taskCommentRoutes = require("./Task/taskComment");
const qaRoutes = require("./qa.routes");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);

// Use Project routes
router.use("/project", projectRoutes);

// Use tasks routes
router.use("/tasks", taskRoutes);
router.use("/taskcomments", taskCommentRoutes);

// Use Q&A routes
router.use("/qa", qaRoutes);

module.exports = router;
