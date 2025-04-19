const mongoose = require("mongoose");

const TaskCommentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
    sentiment: {type: String,enum: ["positive", "neutral", "negative"], default: "neutral"},
    createdAt: { type: Date, default: Date.now },
    attachments: [{
        filename: String,
        contentType: String,
        data: Buffer
      }]  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskComment", TaskCommentSchema);