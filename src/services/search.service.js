const { Question } = require("../models/qa.model");

class SearchService {
  async searchQuestions(query) {
    try {
      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } }
        ]
      };

      const questions = await Question.find(searchQuery)
        .populate("author", "firstName lastName email")
        .sort({ createdAt: -1 });

      return questions;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async searchByTags(tags) {
    try {
      // Validate tags array
      if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error("Tags must be a non-empty array");
      }

      // Find questions that have any of the specified tags (OR operation)
      const questions = await Question.find({
        tags: { $in: tags.map(tag => new RegExp(tag.trim(), "i")) }
      })
        .populate("author", "firstName lastName email")
        .sort({ createdAt: -1 });

      return questions;
    } catch (error) {
      throw new Error(`Tag search failed: ${error.message}`);
    }
  }

  async advancedSearch({ query, tags, author, dateRange }) {
    try {
      const searchCriteria = {};

      if (query) {
        searchCriteria.$or = [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } }
        ];
      }

      if (tags && tags.length > 0) {
        searchCriteria.tags = { $all: tags };
      }

      if (author) {
        searchCriteria.author = author;
      }

      if (dateRange) {
        searchCriteria.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const questions = await Question.find(searchCriteria)
        .populate("author", "firstName lastName email")
        .sort({ createdAt: -1 });

      return questions;
    } catch (error) {
      throw new Error(`Advanced search failed: ${error.message}`);
    }
  }
}

module.exports = new SearchService();