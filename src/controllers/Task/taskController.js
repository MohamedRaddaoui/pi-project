const Task = require("../../models/Task/task");
const { updateProjectStatus } = require("../projectController");
const mongoose = require("mongoose");
const User = require("../../models/user"); // Import User model
const { io } = require("../../../server");
const TaskHistory = require("../../models/Task/taskHistory");
const detectChanges = require("../../../utils/detectChanges");
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
    const tasks = await Task.find()
      .populate("assignedUser", "firstname lastname") 
      .populate("projectId", "title");   
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
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

    // Filtres de base
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
      // Étape 1 : match initial
      { $match: matchStage },

      // Étape 2 : commentaires
      {
        $lookup: {
          from: "taskcomments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },

      // Étape 3 : utilisateur assigné
      {
        $lookup: {
          from: "users",
          localField: "assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $unwind: {
          path: "$assignedUser",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Étape 4 : projet
      {
        $lookup: {
          from: "projects", // nom de la collection MongoDB des projets
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      {
        $unwind: {
          path: "$projectId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Étape 5 : match sur le titre du projet si présent
    if (req.query.projectTitle) {
      pipeline.push({
        $match: {
          "projectId.title": { $regex: `^${req.query.projectTitle}$` }
        },
      });
    }

    // Étape 6 : commentaires inappropriés
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
    }).populate({
      path: "comments",
      populate: {
        path: "user",
        select: "firstname lastname email"
      }
    }).populate("assignedUser", "email");

    // 3. Identifier les changements
    const detectedChanges = detectChanges(oldTask, updatedTask.toObject());

    // 4. Journaliser les changements
    if (Object.keys(detectedChanges).length > 0) {
      await TaskHistory.create({
        task: updatedTask._id,
        updatedBy: req.user.userId,
        changes: detectedChanges,
      });
    }

    // 5. Identifier les utilisateurs concernés
    const commenters = updatedTask.comments.map(c => c.user?._id?.toString()).filter(Boolean);
    const responsible = updatedTask.assignedUser?._id?.toString();

    const userIdsToNotify = [...new Set([...commenters, responsible])];

    const io = req.app.get("io");

    // 6. Envoi des notifications et emails
    for (const userId of userIdsToNotify) {
      const user = await User.findById(userId);
      if (user) {
        const templateData = {
          userName: user.name || user.firstname || "Utilisateur",
          taskTitle: updatedTask.title,
          oldStatus: oldTask.status,
          newStatus: updatedTask.status,
          taskLink: `${process.env.BASE_URL}/tasks/${updatedTask._id}`,
          changes: JSON.stringify(detectedChanges, null, 2),
        };

        await sendEmail(user.email, "Task Updated", templateData);

        io.to(userId).emit("taskUpdated", {
          message: `La tâche "${updatedTask.title}" a été mise à jour. Vérifiez votre email.`,
          taskId: updatedTask._id,
        });

        console.log(`Notification envoyée à l'utilisateur ${userId}`);
      }
    }

    // 7. Mettre à jour le projet lié
    await updateProjectStatus(updatedTask.projectId);

    res.status(200).json({ message: "Tâche mise à jour avec succès", task: updatedTask });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche :", error);
    res.status(400).json({ error: error.message });
  }
};
exports.renderSocketTestPage = async (req, res) => {
  try {
    // Remplace par la logique pour récupérer l"utilisateur connecté
    // Ici je simule un utilisateur avec un ID (ex. connecté via session, JWT, etc.)
    const mockUser = await User.findOne(); // à remplacer si tu as un user connecté

    res.render("socket-test", {
      userId: mockUser._id.toString(),
      userName: mockUser.name
    });
  } catch (error) {
    res.status(500).send("Erreur lors du rendu de la page de test socket.");
  }
};

// 📌 Get a Task by ID
exports.getTaskHistoryById = async (req, res) => {
  try {
    const history = await TaskHistory.find({ task: req.params.taskId })
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


