const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskRoutes = require("./Task/tasks");
const forumRoutes = require("./forums");
const taskCommentRoutes = require("./Task/taskComment");

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
router.use("/taskcomments", taskCommentRoutes);

// Use forum routes
router.use("/forum", forumRoutes);


module.exports = router;
