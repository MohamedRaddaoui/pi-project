const express = require("express");
const router = express.Router();
const commentController = require("../../controllers/Task/taskCommentController");
const { validateComment, validateObjectId} = require("../../middlewares/validation");

router.post("/add", validateComment, commentController.addComment);
router.delete("/delete/:taskId/:commentId",validateObjectId, commentController.deleteComment);

module.exports = router;
