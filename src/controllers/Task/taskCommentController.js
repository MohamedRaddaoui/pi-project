const TaskComment = require("../../models/Task/taskComment");
const Task = require("../../models/Task/task");
const fs = require("fs");
const path = require("path");
exports.addComment = async (req, res) => {
  try {
    const { taskId, userId, text } = req.body;
    const files = req.files;  // Récupération des fichiers envoyés dans le corps de la requête

    // Vérification que les fichiers sont présents
    let attachments = [];
    if (files && files.length > 0) {
      attachments = files.map(file => file.path);  // Enregistrer le chemin des fichiers
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
    task.comments.push({ user: userId, text });
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
