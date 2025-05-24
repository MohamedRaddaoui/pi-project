const mongoose = require('mongoose');
const { Question, Answer } = require("../models/qa.model");

exports.createQuestion = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    console.log('MongoDB connected to:', mongoose.connection.name);
    console.log('Creating question:', { title, content, author, tags });
    const question = new Question({
      title,
      content,
      author,
      tags: tags || []
    });
    await question.save();
    console.log('Question saved:', question);
    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { sort = "newest" } = req.query;
    console.log('MongoDB connected to:', mongoose.connection.name);
    console.log('Fetching questions with sort:', sort);
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
          },
          {
            $project: {
              title: 1,
              content: 1,
              author: 1,
              tags: 1,
              upvotes: 1,
              downvotes: 1,
              voteScore: 1,
              views: 1,
              createdAt: 1,
              answerCount: { $size: "$answers" }
            }
          }
        ]);
        console.log('Unanswered questions fetched:', unansweredQuestions);
        return res.status(200).json(unansweredQuestions);
      default:
        sortOptions = { createdAt: -1 };
    }
    const questions = await Question.aggregate([
      {
        $lookup: {
          from: "answers",
          localField: "_id",
          foreignField: "questionId",
          as: "answers"
        }
      },
      {
        $project: {
          title: 1,
          content: 1,
          author: 1,
          tags: 1,
          upvotes: 1,
          downvotes: 1,
          voteScore: 1,
          views: 1,
          createdAt: 1,
          answerCount: { $size: "$answers" }
        }
      },
      {
        $sort: sortOptions
      }
    ]);
    console.log('Questions fetched:', questions);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId)
      .lean({ virtuals: true });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    await Question.findByIdAndUpdate(req.params.questionId, { $inc: { views: 1 } });
    
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate("author", "firstName lastName email")
      .populate({
        path: "replies",
        populate: { path: "author", select: "firstName lastName email" }
      });
    
    question.answers = answers;
    
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate("author", "firstName lastName email")
      .populate({
        path: "replies",
        populate: { path: "author", select: "firstName lastName email" }
      });
    
    res.status(200).json(answers);
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

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    await Answer.deleteMany({ questionId: question._id });
    await question.remove();
    
    res.status(200).json({ message: "Question and all associated answers deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

exports.createAnswer = async (req, res) => {
  try {
    const { content, author } = req.body;
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
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