const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const taskRoutes = require("./tasks");
const forumRoutes = require("./forums");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);

// Use tasks routes
router.use("/tasks", taskRoutes);

// Use forum routes
router.use("/forum", forumRoutes);

module.exports = router;
