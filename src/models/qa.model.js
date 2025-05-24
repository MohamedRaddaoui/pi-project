const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answerId: { type: Schema.Types.ObjectId, ref: "Answer", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AnswerSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  voteScore: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  voteScore: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  views: { type: Number, default: 0 },
  sentiment: {
    score: { type: Number, default: 0 },
    comparative: { type: Number, default: 0 },
    tokens: [String],
    positive: [String],
    negative: [String],
  },
  frequency: { type: Number, default: 1 },
  lastAnalyzed: { type: Date },
  googleSheetId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for getting answers associated with a question
QuestionSchema.virtual("answers", {
  ref: "Answer",
  localField: "_id",
  foreignField: "questionId"
});

// Enable virtuals in toJSON
QuestionSchema.set('toJSON', { virtuals: true });
QuestionSchema.set('toObject', { virtuals: true });

// Middleware for vote score calculation
QuestionSchema.pre("save", function(next) {
  if (this.isModified("upvotes") || this.isModified("downvotes")) {
    this.voteScore = this.upvotes.length - this.downvotes.length;
  }
  next();
});

AnswerSchema.pre("save", function(next) {
  if (this.isModified("upvotes") || this.isModified("downvotes")) {
    this.voteScore = this.upvotes.length - this.downvotes.length;
  }
  next();
});

// Create and export models with explicit collection names
const Question = mongoose.model("Question", QuestionSchema, "questions");
const Answer = mongoose.model("Answer", AnswerSchema, "answers");
const Reply = mongoose.model("Reply", ReplySchema, "replies");

module.exports = {
  Question,
  Answer,
  Reply
};