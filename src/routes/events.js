const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  validateEvent,
  validateObjectId,
} = require("../middlewares/validation");

router.post("/", validateEvent, eventController.createEvent); // Create event
router.get("/", eventController.getAllEvents); // Get all events
router.get("/:id", validateObjectId, eventController.getEventById); // Get event by ID
router.patch("/:id", validateObjectId, eventController.updateEvent); // Update event
router.delete("/:id", validateObjectId, eventController.deleteEvent); // Delete event

module.exports = router;
