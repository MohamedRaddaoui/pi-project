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
    score: { type: Number, default: 0 },  // Overall sentiment score
    comparative: { type: Number, default: 0 },  // Normalized sentiment score
    tokens: [String],  // Words that contributed to sentiment
    positive: [String],  // Positive words found
    negative: [String],  // Negative words found
  },
  frequency: { type: Number, default: 1 },  // How many times similar questions were asked
  lastAnalyzed: { type: Date },  // When the sentiment was last analyzed
  googleSheetId: { type: String },  // Reference to Google Sheet entry
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for getting answers associated with a question
QuestionSchema.virtual("answers", {
  ref: "Answer",
  localField: "_id",
  foreignField: "questionId"
});

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

// Create and export models
const Question = mongoose.model("Question", QuestionSchema);
const Answer = mongoose.model("Answer", AnswerSchema);
const Reply = mongoose.model("Reply", ReplySchema);

module.exports = {
  Question,
  Answer,
  Reply
};