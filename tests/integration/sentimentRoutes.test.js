const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { Question } = require("../../src/models/qa.model");

describe("Sentiment Analysis Routes", () => {
  let testQuestionId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test question
    const question = new Question({
      title: "Why is my application so slow?",
      content: "The performance is terrible and frustrating",
      author: new mongoose.Types.ObjectId(),
      tags: ["performance", "optimization"]
    });
    await question.save();
    testQuestionId = question._id;
  });

  afterEach(async () => {
    await Question.deleteMany({});
  });

  describe("POST /api/qa/sentiment/analyze", () => {
    test("should analyze text sentiment correctly", async () => {
      const response = await request(app)
        .post("/api/qa/sentiment/analyze")
        .send({ text: "This is amazing and wonderful!" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sentiment).toBeDefined();
      expect(response.body.sentiment.score).toBeGreaterThan(0);
    });

    test("should handle empty text", async () => {
      const response = await request(app)
        .post("/api/qa/sentiment/analyze")
        .send({ text: "" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sentiment.score).toBe(0);
    });
  });

  describe("PUT /api/qa/sentiment/question/:questionId", () => {
    test("should update question sentiment", async () => {
      const response = await request(app)
        .put(`/api/qa/sentiment/question/${testQuestionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sentiment).toBeDefined();
      expect(response.body.sentiment.score).toBeLessThan(0); // Because of "terrible" and "frustrating"
    });

    test("should handle non-existent question", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/qa/sentiment/question/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Question not found");
    });
  });

  describe("GET /api/qa/frequent", () => {
    test("should return frequently asked questions with sentiment", async () => {
      const response = await request(app)
        .get("/api/qa/frequent")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.questions)).toBe(true);
      if (response.body.questions.length > 0) {
        expect(response.body.questions[0].sentiment).toBeDefined();
      }
    });
  });

  describe("PUT /api/qa/frequency/:questionId", () => {
    test("should update question frequency", async () => {
      const response = await request(app)
        .put(`/api/qa/frequency/${testQuestionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.frequency).toBeDefined();
    });
  });
});