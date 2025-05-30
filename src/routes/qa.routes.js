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
router.post("/questions", qaController.createQuestion);
router.get("/questions", qaController.getQuestions);
router.get("/questions/:questionId", qaController.getQuestionById);
router.put("/questions/:questionId", qaController.updateQuestion);
router.delete("/questions/:questionId", qaController.deleteQuestion);
router.post("/questions/:questionId/vote", qaController.voteQuestion);
router.post("/questions/:questionId/answers", qaController.createAnswer);
router.get("/questions/:questionId/answers", qaController.getAnswers); // New endpoint
router.put("/answers/:answerId", qaController.updateAnswer);
router.delete("/answers/:answerId", qaController.deleteAnswer);
router.post("/answers/:answerId/vote", qaController.voteAnswer);
router.post("/answers/:answerId/accept", qaController.acceptAnswer);
router.post("/answers/:answerId/replies", qaController.createReply);
router.put("/replies/:replyId", qaController.updateReply);
router.delete("/replies/:replyId", qaController.deleteReply);
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
