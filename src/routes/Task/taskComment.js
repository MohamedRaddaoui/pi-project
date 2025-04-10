const express = require("express");
const router = express.Router();
const commentController = require("../../controllers/Task/taskCommentController");
const { validateComment, validateObjectId} = require("../../middlewares/validation");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("attachments", 5);  // Limite de 5 fichiers max

router.post("/add",upload, validateComment, commentController.addComment);
router.delete("/delete/:taskId/:commentId",validateObjectId, commentController.deleteComment);
router.delete(
  "/deleteAttachementFromComment/:commentId/:attachmentId",
  commentController.deleteAttachmentFromComment
);
module.exports = router;
