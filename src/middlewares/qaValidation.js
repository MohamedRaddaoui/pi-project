const { body, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Middleware to validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
  const id = req.params.questionId || req.params.answerId || req.params.replyId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  next();
};

// Validation for question creation and update
exports.validateQuestion = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .trim()
    .isLength({ min: 10, max: 150 }).withMessage("Title must be between 10 and 150 characters"),
  
  body("content")
    .notEmpty().withMessage("Content is required")
    .trim()
    .isLength({ min: 30 }).withMessage("Content must be at least 30 characters long"),
  
  body("author")
    .notEmpty().withMessage("Author ID is required")
    .isMongoId().withMessage("Invalid author ID format"),
  
  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags.length > 5) {
        throw new Error("Maximum 5 tags allowed");
      }
      return tags.every(tag => 
        typeof tag === "string" && 
        tag.length >= 2 && 
        tag.length <= 20
      );
    }).withMessage("Each tag must be 2-20 characters long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for answer creation and update
exports.validateAnswer = [
  body("content")
    .notEmpty().withMessage("Answer content is required")
    .trim()
    .isLength({ min: 30 }).withMessage("Answer must be at least 30 characters long"),
  
  body("author")
    .notEmpty().withMessage("Author ID is required")
    .isMongoId().withMessage("Invalid author ID format"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for reply creation and update
exports.validateReply = [
  body("content")
    .notEmpty().withMessage("Reply content is required")
    .trim()
    .isLength({ min: 10 }).withMessage("Reply must be at least 10 characters long"),
  
  body("author")
    .notEmpty().withMessage("Author ID is required")
    .isMongoId().withMessage("Invalid author ID format"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for voting
exports.validateVote = [
  body("userId")
    .notEmpty().withMessage("User ID is required")
    .isMongoId().withMessage("Invalid user ID format"),
  
  body("voteType")
    .notEmpty().withMessage("Vote type is required")
    .isIn(["up", "down"]).withMessage("Vote type must be either \"up\" or \"down\""),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for search queries
exports.validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Search query must be at least 2 characters long"),
  
  query("tags")
    .optional()
    .custom((value) => {
      if (value) {
        const tags = value.split(",").map(tag => tag.trim());
        return tags.every(tag => tag.length >= 2 && tag.length <= 20);
      }
      return true;
    }).withMessage("Each tag must be 2-20 characters long"),

  query("startDate")
    .optional()
    .isISO8601().withMessage("Invalid start date format"),
  
  query("endDate")
    .optional()
    .isISO8601().withMessage("Invalid end date format")
    .custom((value, { req }) => {
      if (value && req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error("End date must be after start date");
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];