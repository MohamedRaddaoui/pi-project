const Task = require("../../models/Task/task");
const { updateProjectStatus } = require("../projectController");
const mongoose = require("mongoose");
const User = require("../../models/user"); // Import User model

const sendEmail = require("../../../utils/sendMailTask"); // Import sendEmail function
// 📌 Create a Task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    //Use this function to automatically update the project status.
    await updateProjectStatus(task.projectId);

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📌 Get all Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json({tasks});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get a Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({task});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Update a Task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

      //Use this function to automatically update the project status.
      await updateProjectStatus(task.projectId);

    res.status(200).json({ message: "Task updated successfully", task: task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📌 Delete a Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    //Use this function to automatically update the project status.
    await updateProjectStatus(task.projectId);
    
    res.status(200).json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 📌 Filtered Search for Tasks
exports.filterTasks = async (req, res) => {
  try {
    const matchStage = {};

    // Appliquer les filtres de base
    if (req.query.assignedUser) {
      matchStage.assignedUser = new mongoose.Types.ObjectId(req.query.assignedUser);
    }
    if (req.query.status) {
      matchStage.status = req.query.status;
    }
    if (req.query.priority) {
      matchStage.priority = req.query.priority;
    }
    if (req.query.dueDate) {
      matchStage.dueDate = { $lte: new Date(req.query.dueDate) };
    }

    const pipeline = [
      {
        $lookup: {
          from: "taskcomments", // attention au nom de la collection en base (en minuscule/pluriel)
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
      {
        $match: matchStage,
      }
    ];

    // Ajouter le filtre pour les commentaires inappropriés si demandé
    if (req.query.inappropriateComments === "true") {
      pipeline.push({
        $match: {
          "comments.isFlagged": true,
        },
      });
    }

    const tasks = await Task.aggregate(pipeline);

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "Aucune tâche trouvée." });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTaskAndSendEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Récupérer la version actuelle AVANT update
    const oldTask = await Task.findById(id).lean();

    if (!oldTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Appliquer la mise à jour
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedUser").populate("comments");

    // 3. Identifier les changements
    const changes = {};
    for (const key in req.body) {
      if (
        oldTask[key] &&
        req.body[key] &&
        JSON.stringify(oldTask[key]) !== JSON.stringify(req.body[key])
      ) {
        changes[key] = {
          from: oldTask[key],
          to: req.body[key]
        };
      }
    }

    // 4. Identifier les utilisateurs concernés
    const commenters = updatedTask.comments.map(c => c.user?._id?.toString()).filter(Boolean);
    const responsible = updatedTask.assignedUser?._id?.toString();

    const userIdsToNotify = [...new Set([...commenters, responsible])];

    // 5. Envoi des emails
    for (const userId of userIdsToNotify) {
      const user = await User.findById(userId); // Récupérer l'utilisateur concerné
      if (user) {
        // Préparer les données pour le template
        const templateData = {
          userName: user.name,
          taskTitle: updatedTask.title,
          oldStatus: oldTask.status,
          newStatus: updatedTask.status,
          taskLink: `${process.env.BASE_URL}/tasks/${updatedTask._id}`,
          changes: JSON.stringify(changes, null, 2), // Afficher les changements de manière lisible
        };

        // Envoyer l'email avec les données et la template
        await sendEmail(user.email, "Task Updated", templateData);
      }
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
      changes
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



