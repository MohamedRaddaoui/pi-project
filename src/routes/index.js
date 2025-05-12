const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskRoutes = require("./Task/tasks");
const forumRoutes = require("./forums");
const taskCommentRoutes = require("./Task/taskComment");
const backlogRoutes = require("./productBacklog")
const sprintProductRoutes = require("./sprintProduct")
const userStoryRoutes = require("./userStory")

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

// Use forum routes
router.use("/forum", forumRoutes);
// Use backlog routes
router.use("/backlog", backlogRoutes)
// Use sprint product routes
router.use("/sprintproduct", sprintProductRoutes)
// Use user story routes
router.use("/userstory", userStoryRoutes)

module.exports = router;
