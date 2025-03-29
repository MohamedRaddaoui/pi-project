const mongoose = require("mongoose");

const TaskCommentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    attachments: [{ type: String }], // Stockera les URLs des fichiers
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskComment", TaskCommentSchema);