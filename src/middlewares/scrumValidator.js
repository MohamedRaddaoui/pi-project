const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  next();
};
validStoryPoints = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
exports.validateUserStory = [
    body("title")
      .notEmpty().withMessage("Title is required")
      .matches(/^En tant que .* je veux .* afin de .*$/i)
      .withMessage("Title must follow the format: En tant que ... je veux ... afin de ..."),

      body("storyPoints")
        .optional()
        .custom(value => validStoryPoints.includes(Number(value)))
        .withMessage(`Story points must follow the Gounachi algorithm: ${validStoryPoints.join(', ')}`),
      
  
    body("priority")
      .optional()
      .isIn(["High", "Medium", "Low"]).withMessage("Invalid priority"),
  
    body("status")
      .optional()
      .isIn(["To Do", "In Progress", "Done"]).withMessage("Invalid status"),
  
    body("sprintID")
      .optional()
      .isMongoId().withMessage("Invalid Sprint ID"),
  
    body("assignedTo")
      .optional()
      .isMongoId().withMessage("Invalid User ID"),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  exports.validateSprint = [
    body("title")
      .notEmpty().withMessage("Sprint title is required")
      .isLength({ min: 3 }).withMessage("Sprint title must be at least 3 characters long")
      .trim(),
  
    body("goal")
      .optional()
      .isLength({ max: 300 }).withMessage("Goal must be less than 300 characters")
      .trim(),
  
    body("startDate")
      .notEmpty().withMessage("Start date is required")
      .isISO8601().withMessage("Invalid start date format")
      .toDate()
      .custom((startDate, { req }) => {
        const endDate = new Date(req.body.endDate);
        if (startDate >= endDate) {
          throw new Error("Start date must be before end date");
        }
        return true;
      }),
  
    body("endDate")
      .notEmpty().withMessage("End date is required")
      .isISO8601().withMessage("Invalid end date format")
      .toDate(),
  
    body("status")
      .optional()
      .isIn(["Planned", "Active", "Completed", "Canceled"])
      .withMessage("Invalid sprint status"),
  
    body("projectID")
      .notEmpty().withMessage("Project ID is required")
      .isMongoId().withMessage("Invalid project ID format"),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  exports.validateBacklog = [
    body("title")
      .notEmpty().withMessage("Backlog title is required")
      .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long")
      .trim(),
  
    body("description")
      .optional()
      .isLength({ max: 500 }).withMessage("Description must not exceed 500 characters")
      .trim(),
  
    body("projectID")
      .notEmpty().withMessage("Project ID is required")
      .isMongoId().withMessage("Invalid project ID format"),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
