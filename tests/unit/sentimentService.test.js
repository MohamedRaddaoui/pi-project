const sentimentService = require("../../src/services/sentiment.service");

jest.mock("sentiment");
jest.mock("googleapis");

describe("SentimentService", () => {
  describe("analyzeSentiment", () => {
    it("should analyze text sentiment", () => {
      const result = sentimentService.analyzeSentiment("I love this feature!");
      
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("comparative");
      expect(result).toHaveProperty("tokens");
      expect(result).toHaveProperty("positive");
      expect(result).toHaveProperty("negative");
    });

    it("should handle negative sentiment", () => {
      const result = sentimentService.analyzeSentiment("This is terrible and frustrating");
      
      expect(result.score).toBeLessThan(0);
      expect(result.negative).toContain("terrible");
      expect(result.negative).toContain("frustrating");
    });
  });

  describe("_calculateSimilarity", () => {
    it("should calculate text similarity correctly", () => {
      const str1 = "how to use async await";
      const str2 = "how to use promises";
      
      const similarity = sentimentService._calculateSimilarity(str1, str2);
      
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it("should return 1 for identical strings", () => {
      const str = "how to use javascript";
      
      const similarity = sentimentService._calculateSimilarity(str, str);
      
      expect(similarity).toBe(1);
    });
  });

  describe("getSimilarQuestions", () => {
    it("should find similar questions above threshold", async () => {
      const questions = [
        { title: "How to use async/await in JavaScript?" },
        { title: "What is the difference between let and var?" },
        { title: "How to handle async operations in JS?" }
      ];

      const finder = await sentimentService.getSimilarQuestions("async javascript");
      const results = await finder(questions);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain("async");
    });
  });
});