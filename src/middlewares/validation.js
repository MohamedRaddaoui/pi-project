const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  next();
};

// Middleware for event validation
exports.validateEvent = [
  body("title").notEmpty().withMessage("Title is required.").trim(),

  body("description").optional().trim(),

  body("location").optional().trim(),

  body("date")
    .notEmpty()
    .withMessage("Date is required.")
    .isISO8601({ strict: true })
    .withMessage("Valid date is required.")
    .customSanitizer((value) => {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    })
    .custom((date) => {
      const today = new Date();
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      if (date < todayMidnight) {
        throw new Error("Date cannot be in the past.");
      }
      return true;
    }),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required.")
    .isISO8601()
    .withMessage("Valid start time is required.")
    .customSanitizer((value) => new Date(value))
    .custom((startTime, { req }) => {
      const eventDate = new Date(req.body.date);
      if (startTime < eventDate) {
        throw new Error("Start time must be on or after the event date.");
      }
      return true;
    }),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required.")
    .isISO8601()
    .withMessage("Valid end time is required.")
    .customSanitizer((value) => new Date(value))
    .custom((endTime, { req }) => {
      if (endTime <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time.");
      }
      return true;
    }),

  body("type")
    .notEmpty()
    .withMessage("Event type is required.")
    .isIn(["Meeting", "Appointment", "Event"])
    .withMessage("Invalid event type."),

  body("reminder")
    .optional()
    .isISO8601()
    .withMessage("Reminder must be a valid date.")
    .customSanitizer((value) => new Date(value))
    .custom((reminder, { req }) => {
      if (reminder >= new Date(req.body.startTime)) {
        throw new Error("Reminder must be before the event starts.");
      }
      return true;
    }),

  body("createdBy")
    .notEmpty()
    .withMessage("CreatedBy is required.")
    .isMongoId()
    .withMessage("CreatedBy must be a valid user ID."),

  // Final validation error check
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateTask = [
  body("title").notEmpty().withMessage("Title is required.").trim(),
  body("description").optional().trim(),
  body("status")
    .isIn(["To Do", "In Progress", "Done"])
    .withMessage("Invalid status."),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Invalid priority."),
  body("dueDate").optional().isISO8601().toDate(),
  body("projectId").isMongoId().withMessage("Invalid project ID."),
  body("assignedUser").optional().isMongoId().withMessage("Invalid user ID."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
exports.validateComment = [
  body("taskId").isMongoId().withMessage("Invalid task ID."),
  body("userId").isMongoId().withMessage("Invalid user ID."),
  body("text").notEmpty().withMessage("Comment text is required.").trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
