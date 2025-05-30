const { Question } = require("../models/qa.model");
const sentimentService = require("../services/sentiment.service");

exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const sentiment = sentimentService.analyzeSentiment(text);
    res.status(200).json({ success: true, sentiment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateQuestionSentiment = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Analyze both title and content
    const titleSentiment = sentimentService.analyzeSentiment(question.title);
    const contentSentiment = sentimentService.analyzeSentiment(question.content);

    // Combine sentiment scores (weighted average)
    question.sentiment = {
      score: (titleSentiment.score * 0.3 + contentSentiment.score * 0.7),
      comparative: (titleSentiment.comparative * 0.3 + contentSentiment.comparative * 0.7),
      tokens: [...new Set([...titleSentiment.tokens, ...contentSentiment.tokens])],
      positive: [...new Set([...titleSentiment.positive, ...contentSentiment.positive])],
      negative: [...new Set([...titleSentiment.negative, ...contentSentiment.negative])]
    };

    question.lastAnalyzed = new Date();
    await question.save();

    res.status(200).json({ success: true, sentiment: question.sentiment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateGoogleSheetsDashboard = async (req, res) => {
  try {
    // Get all questions, sorted by frequency and views
    const questions = await Question.find()
      .sort({ frequency: -1, views: -1 })
      .limit(100); // Limit to top 100 questions

    // Make sure each question has a sentiment property
    for (const question of questions) {
      if (!question.sentiment) {
        // Analyze sentiment if not already present
        const titleSentiment = sentimentService.analyzeSentiment(question.title || "");
        const contentSentiment = sentimentService.analyzeSentiment(question.content || "");

        // Combine sentiment scores (weighted average)
        question.sentiment = {
          score: (titleSentiment.score * 0.3 + contentSentiment.score * 0.7),
          comparative: (titleSentiment.comparative * 0.3 + contentSentiment.comparative * 0.7),
          tokens: [...new Set([...titleSentiment.tokens, ...contentSentiment.tokens])],
          positive: [...new Set([...titleSentiment.positive, ...contentSentiment.positive])],
          negative: [...new Set([...titleSentiment.negative, ...contentSentiment.negative])]
        };
      }
    }

    // Get the data that would be sent to Google Sheets
    const sheetData = await sentimentService.updateGoogleSheet(questions);

    res.status(200).json({
      success: true,
      message: "Google Sheets dashboard data prepared successfully",
      updatedQuestions: questions.length,
      spreadsheetId: sheetData.spreadsheetId,
      spreadsheetUrl: sheetData.spreadsheetUrl,
      sheetData: {
        headers: sheetData.headers,
        rows: sheetData.data
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFrequentQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ frequency: -1, views: -1 })
      .limit(10)
      .select("title content sentiment frequency views voteScore createdAt");

    res.status(200).json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateQuestionFrequency = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Check for similar questions and update frequency
    const similarQuestions = await sentimentService.getSimilarQuestions(question.title);
    if (similarQuestions && similarQuestions.length > 0) {
      question.frequency += 1;
      await question.save();
    }

    res.status(200).json({ success: true, frequency: question.frequency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};