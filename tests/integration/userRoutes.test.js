import request from "supertest";
import express from "express";
import userRouter from "../../src/routes/users";

const app = express();
app.use("/users", userRouter);

describe("GET /users", () => {
  it("should respond with a resource", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.text).toBe("respond with a resource");
  });
});
