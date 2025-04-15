const Task = require("../../models/Task/task");
const { updateProjectStatus } = require("../projectController");
const mongoose = require("mongoose");

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

