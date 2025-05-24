const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../../app");
const { Question, Answer } = require("../../src/models/qa.model");
const { User } = require("../../src/models/user");

let testUser;
let testQuestion;

beforeAll(async () => {
  // Create a test user
  testUser = await User.create({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "password123"
  });
});

beforeEach(async () => {
  // Clear the questions and answers collections
  await Question.deleteMany({});
  await Answer.deleteMany({});
  
  // Create a test question
  testQuestion = await Question.create({
    title: "Test Question",
    content: "This is a test question content",
    author: testUser._id,
    tags: ["test", "integration"]
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Question API Endpoints", () => {
  describe("POST /api/qa/questions", () => {
    it("should create a new question", async () => {
      const res = await request(app)
        .post("/api/qa/questions")
        .send({
          title: "New Test Question",
          content: "This is the content of my test question",
          author: testUser._id,
          tags: ["test"]
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Test Question");
      expect(res.body.author).toBe(testUser._id.toString());
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/qa/questions")
        .send({
          title: "Test"
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/qa/questions", () => {
    it("should get all questions", async () => {
      const res = await request(app).get("/api/qa/questions");
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should sort questions by newest", async () => {
      const res = await request(app)
        .get("/api/qa/questions")
        .query({ sort: "newest" });

      expect(res.status).toBe(200);
      expect(res.body[0].createdAt).toBeDefined();
    });
  });

  describe("GET /api/qa/questions/:questionId", () => {
    it("should get question by id", async () => {
      const res = await request(app)
        .get(`/api/qa/questions/${testQuestion._id}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(testQuestion._id.toString());
    });

    it("should increment view count", async () => {
      const before = await Question.findById(testQuestion._id);
      const initialViews = before.views;

      await request(app).get(`/api/qa/questions/${testQuestion._id}`);
      
      const after = await Question.findById(testQuestion._id);
      expect(after.views).toBe(initialViews + 1);
    });
  });
});

describe("Answer API Endpoints", () => {
  let testAnswer;

  beforeEach(async () => {
    testAnswer = await Answer.create({
      content: "Test answer content",
      author: testUser._id,
      questionId: testQuestion._id
    });
  });

  describe("POST /api/qa/questions/:questionId/answers", () => {
    it("should create a new answer", async () => {
      const res = await request(app)
        .post(`/api/qa/questions/${testQuestion._id}/answers`)
        .send({
          content: "This is a test answer",
          author: testUser._id
        });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("This is a test answer");
    });
  });

  describe("PUT /api/qa/answers/:answerId/vote", () => {
    it("should upvote an answer", async () => {
      const res = await request(app)
        .post(`/api/qa/answers/${testAnswer._id}/vote`)
        .send({
          userId: testUser._id,
          voteType: "up"
        });

      expect(res.status).toBe(200);
      expect(res.body.upvotes).toContain(testUser._id.toString());
    });
  });
});

describe("Search API Endpoints", () => {
  beforeEach(async () => {
    await Question.create([
      {
        title: "JavaScript Promises",
        content: "How do promises work in JavaScript?",
        author: testUser._id,
        tags: ["javascript", "async"]
      },
      {
        title: "Node.js Error Handling",
        content: "Best practices for handling errors in Node.js",
        author: testUser._id,
        tags: ["nodejs", "error-handling"]
      }
    ]);
  });

  describe("GET /api/qa/search", () => {
    it("should search questions by query", async () => {
      const res = await request(app)
        .get("/api/qa/search")
        .query({ q: "JavaScript" });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toContain("JavaScript");
    });

    it("should search questions by tags", async () => {
      const res = await request(app)
        .get("/api/qa/search/tags")
        .query({ tags: "javascript,async" });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].tags).toContain("javascript");
    });
  });
});