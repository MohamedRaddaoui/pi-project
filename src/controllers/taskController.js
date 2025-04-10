const Task = require("../models/task");
const { updateProjectStatus } = require("./projectController");


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
    res.status(200).json(tasks);
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
    res.status(200).json(task);
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

    res.status(200).json({ message: "Task updated successfully", task });
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
