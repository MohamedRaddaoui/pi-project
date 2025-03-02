const request = require("supertest");
const express = require("express");
const userRouter = require("../../routes/users");

const app = express();
app.use("/users", userRouter);

describe("GET /users", () => {
  it("should respond with a resource", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.text).toBe("respond with a resource");
  });
});
