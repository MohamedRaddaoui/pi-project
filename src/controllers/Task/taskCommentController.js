const Comment = require("../../models/Task/taskComment");
const Task = require("../../models/Task/task");

//  Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const { taskId, userId, text, attachments } = req.body;
    const comment = new Comment({ task: taskId, user: userId, text, attachments });
    await comment.save();

    // Ajouter le commentaire à la tâche
    await Task.findByIdAndUpdate(taskId, { $push: { comments: comment._id } });

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { commentId, taskId } = req.params;

    await Comment.findByIdAndDelete(commentId);
    await Task.findByIdAndUpdate(taskId, { $pull: { comments: commentId } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
