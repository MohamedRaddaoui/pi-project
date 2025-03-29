const express = require("express");
const router = express.Router();
const commentController = require("../../controllers/Task/taskCommentController");
const { validateComment, validateObjectId} = require("../../middlewares/validation");

router.post("/add", commentController.addComment);
router.delete("/delete/:taskId/:commentId",validateObjectId, validateComment, commentController.deleteComment);

module.exports = router;
