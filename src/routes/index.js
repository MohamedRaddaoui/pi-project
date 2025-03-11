const express = require("express");
const eventRoutes = require("./events");
const userRoutes = require("./users");

const router = express.Router();

// Use event routes
router.use("/events", eventRoutes);

// Use user routes
router.use("/users", userRoutes);

module.exports = router;
