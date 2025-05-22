const { Question, Answer } = require("../models/qa.model");

// Question Controllers
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    const question = new Question({
      title,
      content,
      author,
      tags: tags || []
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { sort = "newest" } = req.query;
    let sortOptions = {};
    
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "popular":
        sortOptions = { voteScore: -1 };
        break;
      case "unanswered":
        const unansweredQuestions = await Question.aggregate([
          {
            $lookup: {
              from: "answers",
              localField: "_id",
              foreignField: "questionId",
              as: "answers"
            }
          },
          {
            $match: {
              "answers": { $size: 0 }
            }
          },
          {
            $sort: { createdAt: -1 }
          }
        ]);
        return res.status(200).json(unansweredQuestions);
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const questions = await Question.find()
      .sort(sortOptions)
      .populate("author", "firstName lastName email");
    
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)
      .populate("author", "firstName lastName email")
      .populate({
        path: "answers",
        populate: [
          { path: "author", select: "firstName lastName email" },
          {
            path: "replies",
            populate: { path: "author", select: "firstName lastName email" }
          }
        ]
      });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    question.views += 1;
    await question.save();
    
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    question.updatedAt = Date.now();
    
    await question.save();
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mongoose = require("mongoose");

exports.deleteQuestion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid question ID" });
    }

    // Find the question
    const question = await Question.findById(req.params.questionId).session(session);
    
    if (!question) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Question not found" });
    }

    // Optional: Check if the user is authorized to delete the question
    // Assuming req.user contains the authenticated user's data
    // Uncomment and adjust based on your auth setup
    /*
    if (question.author.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Unauthorized to delete this question" });
    }
    */

    // Delete all associated answers (replies are embedded, so they’ll be deleted automatically)
    await Answer.deleteMany({ questionId: question._id }).session(session);

    // Delete the question using findByIdAndDelete instead of remove()
    await Question.findByIdAndDelete(req.params.questionId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Question and all associated answers deleted" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: `Failed to delete question: ${error.message}` });
  }
};

// Vote Controllers
exports.voteQuestion = async (req, res) => {
  try {
    const { userId, voteType } = req.body;
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    if (voteType === "up") {
      if (question.upvotes.includes(userId)) {
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
      } else {
        question.upvotes.push(userId);
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId);
      }
    } else if (voteType === "down") {
      if (question.downvotes.includes(userId)) {
        question.downvotes = question.downvotes.filter(id => id.toString() !== userId);
      } else {
        question.downvotes.push(userId);
        question.upvotes = question.upvotes.filter(id => id.toString() !== userId);
      }
    }
    
    await question.save();
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Answer Controllers
exports.createAnswer = async (req, res) => {
  try {
    const { content, author } = req.body;
    const answer = new Answer({
      content,
      author,
      questionId: req.params.questionId
    });
    
    await answer.save();
    res.status(201).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    
    answer.content = content;
    answer.updatedAt = Date.now();
    
    await answer.save();
    res.status(200).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    
    await answer.remove();
    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.voteAnswer = async (req, res) => {
  try {
    const { userId, voteType } = req.body;
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    
    if (voteType === "up") {
      if (answer.upvotes.includes(userId)) {
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId);
      } else {
        answer.upvotes.push(userId);
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId);
      }
    } else if (voteType === "down") {
      if (answer.downvotes.includes(userId)) {
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId);
      } else {
        answer.downvotes.push(userId);
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId);
      }
    }
    
    await answer.save();
    res.status(200).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.acceptAnswer = async (req, res) => {
  try {
    const { questionAuthorId } = req.body;
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    
    const question = await Question.findById(answer.questionId);
    
    if (question.author.toString() !== questionAuthorId) {
      return res.status(403).json({ message: "Only the question author can accept an answer" });
    }
    
    // Reset all other answers to not accepted
    await Answer.updateMany(
      { questionId: answer.questionId },
      { isAccepted: false }
    );
    
    answer.isAccepted = true;
    await answer.save();
    
    res.status(200).json(answer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reply Controllers
exports.createReply = async (req, res) => {
  try {
    const { content, author } = req.body;
    const answer = await Answer.findById(req.params.answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    
    const reply = {
      content,
      author,
      answerId: answer._id
    };
    
    answer.replies.push(reply);
    await answer.save();
    
    const newReply = answer.replies[answer.replies.length - 1];
    res.status(201).json(newReply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateReply = async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findOne({ "replies._id": req.params.replyId });
    
    if (!answer) {
      return res.status(404).json({ message: "Reply not found" });
    }
    
    const reply = answer.replies.id(req.params.replyId);
    reply.content = content;
    reply.updatedAt = Date.now();
    
    await answer.save();
    res.status(200).json(reply);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const answer = await Answer.findOne({ "replies._id": req.params.replyId });
    
    if (!answer) {
      return res.status(404).json({ message: "Reply not found" });
    }
    
    answer.replies.id(req.params.replyId).remove();
    await answer.save();
    
    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};