const TaskComment = require("../../models/Task/taskComment");
const Task = require("../../models/Task/task");
const { checkComment } = require("../../../utils/badWordFilter");
const Sentiment = require("sentiment");
const sentimentAnalyzer = new Sentiment();

exports.addComment = async (req, res) => {
  try {
    const { taskId, userId, text } = req.body;
    const files = req.files;

    const { isFlagged } = await checkComment(text);
   
    // Analyse du sentiment
    const sentimentResult = sentimentAnalyzer.analyze(text);
    let sentiment = "neutral";
    if (sentimentResult.score > 1) sentiment = "positive";
    else if (sentimentResult.score < -1) sentiment = "negative";


    // Vérifier si la tâche existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Construire les attachments
    let attachments = [];
    if (files && files.length > 0) {
      attachments = files.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer
      }));
    }

    // Créer le commentaire
    const comment = new TaskComment({
      task: taskId,
      user: userId,
      text,
      attachments,
      isFlagged,
      sentiment
    });

    await comment.save();

    // Ajouter l'ID du commentaire à la tâche
    task.comments.push(comment._id);
    await task.save();

    res.status(201).json({
      message: isFlagged
        ? "Commentaire ajouté, mais signalé comme inapproprié"
        : "Commentaire ajouté avec succès",
      sentiment: sentiment,
      comment
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//  Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { commentId, taskId } = req.params;

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Supprimer le commentaire
    await TaskComment.findByIdAndDelete(commentId);

    // Supprimer la référence dans la tâche
    await Task.findByIdAndUpdate(taskId, {
      $pull: { comments: commentId }
    });

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
exports.getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Vérifie si la tâche existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    // Récupère les commentaires associés à cette tâche
    const comments = await TaskComment.find({ task: taskId })
      .populate("user", "firstname lastname email _id")
      .select("-__v"); // Facultatif : on peut exclure __v

    res.status(200).json({ comments });

  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error);
    res.status(500).json({ error: error.message });
  }
};
