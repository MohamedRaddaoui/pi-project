const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");

/**
 * @swagger
 * tags:
 *   name: Forum
 *   description: API for managing forums, comments, and replies
 */

// Forum routes
/**
 * @swagger
 * /forum:
 *   post:
 *     summary: Create a new forum
 *     tags: [Forum]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the forum
 *               description:
 *                 type: string
 *                 description: Description of the forum
 *               createdBy:
 *                 type: string
 *                 description: User ID who created the forum
 *     responses:
 *       201:
 *         description: Forum created successfully
 *       400:
 *         description: Bad request (validation errors)
 */
router.post("/", forumController.createForum);

/**
 * @swagger
 * /forum/{forumId}:
 *   get:
 *     summary: Get a forum by ID
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forum retrieved successfully
 *       404:
 *         description: Forum not found
 */
router.get("/:forumId", forumController.getForumById);

/**
 * @swagger
 * /forum/user/{userId}:
 *   get:
 *     summary: Get forums by user ID
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forums retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/user/:userId", forumController.getForumsByUserId);

/**
 * @swagger
 * /forum:
 *   get:
 *     summary: Get all forums
 *     tags: [Forum]
 *     responses:
 *       200:
 *         description: List of all forums
 */
router.get("/", forumController.getAllForums);

/**
 * @swagger
 * /forum:
 *   put:
 *     summary: Update a forum
 *     tags: [Forum]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forumId:
 *                 type: string
 *                 description: ID of the forum
 *               title:
 *                 type: string
 *                 description: Title of the forum
 *               description:
 *                 type: string
 *                 description: Description of the forum
 *     responses:
 *       200:
 *         description: Forum updated successfully
 *       404:
 *         description: Forum not found
 */
router.put("/", forumController.updateForum);

/**
 * @swagger
 * /forum/{forumId}:
 *   delete:
 *     summary: Delete a forum
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forum deleted successfully
 *       404:
 *         description: Forum not found
 */
router.delete("/:forumId", forumController.deleteForum);

// Comment routes
/**
 * @swagger
 * /forum/{forumId}/comment:
 *   post:
 *     summary: Create a new comment inside a forum
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the comment
 *               user:
 *                 type: string
 *                 description: User ID who posted the comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: Forum not found
 */
router.post("/:forumId/comment", forumController.createComment);

/**
 * @swagger
 * /forum/{forumId}/comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all comments
 *       404:
 *         description: Forum not found
 */
router.get("/:forumId/comments", forumController.getAllComments);

/**
 * @swagger
 * /forum/{forumId}/comment/{commentId}:
 *   put:
 *     summary: Edit a comment
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
router.put("/:forumId/comment/:commentId", forumController.editComment);

/**
 * @swagger
 * /forum/{forumId}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete("/:forumId/comment/:commentId", forumController.deleteComment);

// Reply routes
/**
 * @swagger
 * /forum/{forumId}/comment/{commentId}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID who is replying
 *               text:
 *                 type: string
 *                 description: The reply content
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       404:
 *         description: Comment not found
 */
router.post("/:forumId/comment/:commentId/reply", forumController.replyToComment);

/**
 * @swagger
 * /forum/{forumId}/comment/{commentId}/reply/{replyId}:
 *   put:
 *     summary: Edit a reply
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
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
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The updated reply content
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       404:
 *         description: Reply not found
 */
router.put("/:forumId/comment/:commentId/reply/:replyId", forumController.editReply);

/**
 * @swagger
 * /forum/{forumId}/comment/{commentId}/reply/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
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
router.delete("/:forumId/comment/:commentId/reply/:replyId", forumController.deleteReply);

module.exports = router;
