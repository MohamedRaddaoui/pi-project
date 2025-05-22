const express = require("express");
const router = express.Router();
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskRoutes = require("./Task/tasks");
const forumRoutes = require("./forums");
const taskCommentRoutes = require("./Task/taskComment");
const chatbotAPI = require("../config/open-ai")
const backlogRoutes = require("./productBacklog")
const sprintProductRoutes = require("./sprintProduct")
const userStoryRoutes = require("./userStory")

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
router.use("/sprint", sprintProductRoutes)
// Use user story routes
router.use("/userstory", userStoryRoutes)

//ChatBot Api
router.post("/chatbot", chatbotAPI);

module.exports = router;
