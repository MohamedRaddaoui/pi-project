const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");
const projectRoutes = require("./project");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);

router.use("/project",projectRoutes)

module.exports = router;
