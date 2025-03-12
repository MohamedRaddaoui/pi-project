const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const taskRoutes = require("./tasks");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);

// Use tasks routes

router.use("/tasks", taskRoutes);

module.exports = router;
