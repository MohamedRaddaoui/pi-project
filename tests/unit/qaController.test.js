const { Question, Answer } = require("../../src/models/qa.model");
const qaController = require("../../src/controllers/qaController");

// Mock the mongoose models
jest.mock("../../src/models/qa.model");

describe("QAController", () => {
  let mockRequest;
  let mockResponse;
  
  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("createQuestion", () => {
    it("should create a question successfully", async () => {
      const questionData = {
        title: "Test Question",
        content: "Test Content",
        author: "user123",
        tags: ["test"]
      };
      
      mockRequest.body = questionData;
      
      Question.prototype.save = jest.fn().mockResolvedValue(questionData);
      
      await qaController.createQuestion(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining(questionData));
    });

    it("should handle validation errors", async () => {
      mockRequest.body = { title: "Test" }; // Missing required fields
      
      Question.prototype.save = jest.fn().mockRejectedValue(new Error("Validation failed"));
      
      await qaController.createQuestion(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String)
      }));
    });
  });

  describe("getQuestions", () => {
    it("should get questions sorted by newest", async () => {
      const mockQuestions = [
        { title: "Question 1", createdAt: new Date() },
        { title: "Question 2", createdAt: new Date() }
      ];
      
      mockRequest.query = { sort: "newest" };
      Question.find = jest.fn().mockReturnThis();
      Question.sort = jest.fn().mockReturnThis();
      Question.populate = jest.fn().mockResolvedValue(mockQuestions);
      
      await qaController.getQuestions(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockQuestions);
    });

    it("should handle getting unanswered questions", async () => {
      const mockUnanswered = [
        { title: "Unanswered 1", answers: [] }
      ];
      
      mockRequest.query = { sort: "unanswered" };
      Question.aggregate = jest.fn().mockResolvedValue(mockUnanswered);
      
      await qaController.getQuestions(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUnanswered);
    });
  });

  describe("voteQuestion", () => {
    let mockQuestion;

    beforeEach(() => {
      mockQuestion = {
        _id: "question123",
        upvotes: ["user1"],
        downvotes: ["user2"],
        save: jest.fn().mockResolvedValue(true)
      };
    });

    it("should add upvote successfully", async () => {
      mockRequest.params = { questionId: "question123" };
      mockRequest.body = { userId: "user3", voteType: "up" };
      
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      
      await qaController.voteQuestion(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockQuestion.upvotes).toContain("user3");
    });

    it("should remove existing upvote", async () => {
      mockRequest.params = { questionId: "question123" };
      mockRequest.body = { userId: "user1", voteType: "up" };
      
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      
      await qaController.voteQuestion(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockQuestion.upvotes).not.toContain("user1");
    });
  });

  describe("acceptAnswer", () => {
    it("should accept answer successfully", async () => {
      const mockAnswer = {
        _id: "answer123",
        questionId: "question123",
        isAccepted: false,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockQuestion = {
        _id: "question123",
        author: "user123"
      };

      mockRequest.params = { answerId: "answer123" };
      mockRequest.body = { questionAuthorId: "user123" };

      Answer.findById = jest.fn().mockResolvedValue(mockAnswer);
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Answer.updateMany = jest.fn().mockResolvedValue(true);

      await qaController.acceptAnswer(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockAnswer.isAccepted).toBe(true);
    });

    it("should reject unauthorized accept attempt", async () => {
      const mockAnswer = {
        questionId: "question123"
      };

      const mockQuestion = {
        author: "user123"
      };

      mockRequest.params = { answerId: "answer123" };
      mockRequest.body = { questionAuthorId: "differentUser" };

      Answer.findById = jest.fn().mockResolvedValue(mockAnswer);
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);

      await qaController.acceptAnswer(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});