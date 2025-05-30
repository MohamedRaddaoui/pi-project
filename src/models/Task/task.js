const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: { type: Date },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "project", required: true },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "TaskComment" }],    
    tags: { type: String, trim: true },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
