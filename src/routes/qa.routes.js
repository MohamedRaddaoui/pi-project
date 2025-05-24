const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");
const qaSearchController = require("../controllers/qaSearch.controller");
const sentimentController = require("../controllers/sentimentAnalysis.controller");
const {
  validateQuestion,
  validateAnswer,
  validateReply,
  validateVote,
  validateSearch,
  validateObjectId,
} = require("../middlewares/qaValidation");

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the question
 *         content:
 *           type: string
 *           description: The content/body of the question
 *         author:
 *           type: string
 *           description: User ID of the author
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         upvotes:
 *           type: array
 *           items:
 *             type: string
 *         downvotes:
 *           type: array
 *           items:
 *             type: string
 *         voteScore:
 *           type: number
 *         views:
 *           type: number
 *     Answer:
 *       type: object
 *       required:
 *         - content
 *         - author
 *         - questionId
 *       properties:
 *         content:
 *           type: string
 *           description: The content of the answer
 *         author:
 *           type: string
 *           description: User ID of the author
 *         questionId:
 *           type: string
 *           description: ID of the question being answered
 *         isAccepted:
 *           type: boolean
 *         upvotes:
 *           type: array
 *           items:
 *             type: string
 *         downvotes:
 *           type: array
 *           items:
 *             type: string
 *         voteScore:
 *           type: number
 *     Reply:
 *       type: object
 *       required:
 *         - content
 *         - author
 *       properties:
 *         content:
 *           type: string
 *           description: The content of the reply
 *         author:
 *           type: string
 *           description: User ID of the author
 */

/**
 * @swagger
 * tags:
 *   name: Q&A
 *   description: Question and Answer management API
 */

/**
 * @swagger
 * /qa/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Q&A]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Question"
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/questions", validateQuestion, qaController.createQuestion);

/**
 * @swagger
 * /qa/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Q&A]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, popular, unanswered]
 *         description: Sort order for questions
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Question"
 */
router.get("/questions", qaController.getQuestions);

/**
 * @swagger
 * /qa/questions/{questionId}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question details with answers and replies
 *       404:
 *         description: Question not found
 */
router.get("/questions/:questionId", qaController.getQuestionById);

/**
 * @swagger
 * /qa/questions/{questionId}:
 *   put:
 *     summary: Update a question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Question"
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
router.put(
  "/questions/:questionId",
  [validateObjectId, validateQuestion],
  qaController.updateQuestion
);

/**
 * @swagger
 * /qa/questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
router.delete("/questions/:questionId", qaController.deleteQuestion);

/**
 * @swagger
 * /qa/questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - voteType
 *             properties:
 *               userId:
 *                 type: string
 *               voteType:
 *                 type: string
 *                 enum: [up, down]
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       404:
 *         description: Question not found
 */
router.post(
  "/questions/:questionId/vote",
  [validateObjectId, validateVote],
  qaController.voteQuestion
);

/**
 * @swagger
 * /qa/questions/{questionId}/answers:
 *   post:
 *     summary: Add an answer to a question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Answer"
 *     responses:
 *       201:
 *         description: Answer created successfully
 *       404:
 *         description: Question not found
 */
router.post(
  "/questions/:questionId/answers",
  [validateObjectId, validateAnswer],
  qaController.createAnswer
);

/**
 * @swagger
 * /qa/answers/{answerId}:
 *   put:
 *     summary: Update an answer
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Answer"
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *       404:
 *         description: Answer not found
 */
router.put(
  "/answers/:answerId",
  [validateObjectId, validateAnswer],
  qaController.updateAnswer
);

/**
 * @swagger
 * /qa/answers/{answerId}:
 *   delete:
 *     summary: Delete an answer
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *       404:
 *         description: Answer not found
 */
router.delete("/answers/:answerId", qaController.deleteAnswer);

/**
 * @swagger
 * /qa/answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - voteType
 *             properties:
 *               userId:
 *                 type: string
 *               voteType:
 *                 type: string
 *                 enum: [up, down]
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       404:
 *         description: Answer not found
 */
router.post(
  "/answers/:answerId/vote",
  [validateObjectId, validateVote],
  qaController.voteAnswer
);

/**
 * @swagger
 * /qa/answers/{answerId}/accept:
 *   post:
 *     summary: Accept an answer
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionAuthorId
 *             properties:
 *               questionAuthorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer accepted successfully
 *       404:
 *         description: Answer not found
 */
router.post("/answers/:answerId/accept", qaController.acceptAnswer);

/**
 * @swagger
 * /qa/answers/{answerId}/replies:
 *   post:
 *     summary: Add a reply to an answer
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Reply"
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       404:
 *         description: Answer not found
 */
router.post(
  "/answers/:answerId/replies",
  [validateObjectId, validateReply],
  qaController.createReply
);

/**
 * @swagger
 * /qa/replies/{replyId}:
 *   put:
 *     summary: Update a reply
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Reply"
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       404:
 *         description: Reply not found
 */
router.put(
  "/replies/:replyId",
  [validateObjectId, validateReply],
  qaController.updateReply
);

/**
 * @swagger
 * /qa/replies/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *       404:
 *         description: Reply not found
 */
router.delete("/replies/:replyId", qaController.deleteReply);
/**
 * @swagger
 * /qa/search:
 *   get:
 *     summary: Search questions by query string or tags
 *     tags: [Q&A]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query string (minimum 2 characters)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags (2-20 characters each)
 *     responses:
 *       200:
 *         description: List of matching questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Question"
 *       400:
 *         description: Invalid search parameters
 */
router.get("/search/tags", validateSearch, qaSearchController.searchByTags);

/**
 * @swagger
 * /qa/search/advanced:
 *   get:
 *     summary: Advanced search
 *     tags: [Q&A]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Author ID to filter by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter (ISO 8601)
 *     responses:
 *       200:
 *         description: List of matching questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Question"
 *       400:
 *         description: Invalid search parameters
 */
router.get(
  "/search/advanced",
  validateSearch,
  qaSearchController.advancedSearch
);

/**
 * @swagger
 * /qa/sentiment/analyze:
 *   post:
 *     summary: Analyze sentiment of provided text
 *     tags: [Q&A]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to analyze
 *     responses:
 *       200:
 *         description: Sentiment analysis results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SentimentResponse"
 *       400:
 *         description: Invalid input
 */
router.post("/sentiment/analyze", sentimentController.analyzeSentiment);

/**
 * @swagger
 * /qa/sentiment/question/{questionId}:
 *   put:
 *     summary: Update sentiment analysis for a specific question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to analyze
 *     responses:
 *       200:
 *         description: Updated sentiment analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SentimentResponse"
 *       404:
 *         description: Question not found
 */
router.put(
  "/sentiment/question/:questionId",
  sentimentController.updateQuestionSentiment
);

/**
 * @swagger
 * /qa/dashboard/update:
 *   post:
 *     summary: Update Google Sheets dashboard with latest Q&A data
 *     tags: [Q&A]
 *     description: |
 *       Updates the Google Sheets dashboard with the latest question data, including:
 *       - Question titles and content
 *       - Frequency of similar questions
 *       - Sentiment analysis scores
 *       - View counts and vote scores
 *       - Timestamps
 *
 *       Requires proper Google Sheets API configuration and credentials.
 *     responses:
 *       200:
 *         description: Dashboard updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GoogleSheetsDashboardResponse"
 *       401:
 *         description: Google Sheets authentication failed
 *       500:
 *         description: Failed to update dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Google Sheets API error: insufficient permissions"
 */
router.post(
  "/dashboard/update",
  sentimentController.updateGoogleSheetsDashboard
);

/**
 * @swagger
 * /qa/frequent:
 *   get:
 *     summary: Get frequently asked questions with sentiment data
 *     tags: [Q&A]
 *     responses:
 *       200:
 *         description: List of frequent questions with sentiment analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FrequentQuestionsResponse"
 */
router.get("/frequent", sentimentController.getFrequentQuestions);

/**
 * @swagger
 * /qa/frequency/{questionId}:
 *   put:
 *     summary: Update frequency counter for a question
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to update frequency for
 *     responses:
 *       200:
 *         description: Updated question frequency
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 frequency:
 *                   type: integer
 *       404:
 *         description: Question not found
 */
router.put(
  "/frequency/:questionId",
  sentimentController.updateQuestionFrequency
);

module.exports = router;
