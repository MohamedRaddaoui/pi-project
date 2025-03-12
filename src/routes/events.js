const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  validateEvent,
  validateObjectId,
} = require("../middlewares/validation");


/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API for managing events
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - startTime
 *         - endTime
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the event
 *         title:
 *           type: string
 *           description: Title of the event
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Event start time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Event end time
 *         type:
 *           type: string
 *           enum: [conference, workshop, webinar]
 *           description: Type of event
 *       example:
 *         id: "60d21b4667d0d8992e610c85"
 *         title: "Tech Conference 2025"
 *         startTime: "2025-06-15T10:00:00Z"
 *         endTime: "2025-06-15T16:00:00Z"
 *         type: "conference"
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad request (validation errors)
 */
router.post("/", validateEvent, eventController.createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all events
 */
router.get("/", eventController.getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", validateObjectId, eventController.getEventById);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.patch("/:id", validateObjectId, eventController.updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete("/:id", validateObjectId, eventController.deleteEvent);

router.post("/", validateEvent, eventController.createEvent); // Create event
router.get("/", eventController.getAllEvents); // Get all events
router.get("/:id", validateObjectId, eventController.getEventById); // Get event by ID
router.patch("/:id", validateObjectId, eventController.updateEvent); // Update event
router.delete("/:id", validateObjectId, eventController.deleteEvent); // Delete event


module.exports = router;
