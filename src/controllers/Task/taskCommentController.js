const TaskComment = require("../../models/Task/taskComment");
const Task = require("../../models/Task/task");

exports.addComment = async (req, res) => {
  try {
    const { taskId, userId, text } = req.body;
    const files = req.files;  // Récupération des fichiers envoyés dans le corps de la requête

     let attachments = [];
    if (files && files.length > 0) {
      attachments = files.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer
      }));
    }
    // Vérifier si la tâche existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Créer le commentaire
    const comment = new TaskComment({ task: taskId, user: userId, text, attachments });
    await comment.save();

    // Ajouter le commentaire à la tâche
    task.comments.push({ user: userId, text, attachments: comment.attachments.map(att => att._id) });
    await task.save();

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
exports.deleteAttachmentFromComment = async (req, res) => {
  try {
    const { commentId, attachmentId } = req.params;

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const originalLength = comment.attachments.length;
    comment.attachments = comment.attachments.filter(att => att._id.toString() !== attachmentId);

    if (comment.attachments.length === originalLength) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    await comment.save();

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};