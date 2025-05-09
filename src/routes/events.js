const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  validateEvent,
  validateObjectId,
} = require("../middlewares/validation");
const upload = require("../middlewares/upload");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API for managing events
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event with optional attachments
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - startTime
 *               - endTime
 *               - type
 *               - maxAttendees
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Meeting, Appointment, Deadline, Event]
 *               maxAttendees:
 *                 type: integer
 *               visibility:
 *                 type: string
 *                 enum: [Public, Private]
 *               repeat:
 *                 type: string
 *                 enum: [None, Daily, Weekly, Monthly]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post(
  "/",
  auth,
  upload.array("attachments"),
  validateEvent,
  eventController.createEvent
);

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
router.get("/getEventById/:id", eventController.getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an existing event and optionally add attachments
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Meeting, Appointment, Event]
 *               maxAttendees:
 *                 type: integer
 *               visibility:
 *                 type: string
 *                 enum: [Public, Private]
 *               repeat:
 *                 type: string
 *                 enum: [None, Daily, Weekly, Monthly]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

router.patch(
  "/updateEventById/:id",
  upload.array("attachments"),
  eventController.updateEvent
);

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
router.delete("/deleteEventById/:id", eventController.deleteEvent);

/**
 * @swagger
 * /events/{eventId}/participate:
 *   post:
 *     summary: Participate in an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6611b8b3fe56c23d645fbc3d
 *     responses:
 *       200:
 *         description: User successfully registered for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participation successful. Confirmation email sent.
 *       400:
 *         description: User already participating or invalid input
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.post("/:eventId/participate", eventController.participateEvent);

/**
 * @swagger
 * /events/{eventId}/cancel:
 *   post:
 *     summary: Cancel participation in an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6611b8b3fe56c23d645fbc3d
 *     responses:
 *       200:
 *         description: Participation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participation cancelled successfully.
 *       400:
 *         description: User is not participating in this event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.post("/:eventId/cancel", eventController.cancelParticipation);

// Sync events to Google Calendar
router.post("/sync", auth, eventController.syncEvents);

// handle Google Calendar CallBack
router.get("/oauth2callback", eventController.handleCallBack);

router.get('/user/:userId', auth, eventController.getUserEvents);

module.exports = router;
