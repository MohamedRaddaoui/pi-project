const mongoose = require("mongoose");

const TaskCommentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    attachments: [{ type: String }], // Store file paths of the uploaded files
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskComment", TaskCommentSchema);