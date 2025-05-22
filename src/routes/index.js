const express = require("express");
const router = express.Router();
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");
const taskCommentRoutes = require("./Task/taskComment");
const qaRoutes = require("./qa.routes");
const taskRoutes = require("./Task/tasks");
const forumRoutes = require("./forums");
const chatbotAPI = require("../config/open-ai");

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

// Use forum routes
router.use("/forum", forumRoutes);

//ChatBot Api
router.post("/chatbot", chatbotAPI);

module.exports = router;
