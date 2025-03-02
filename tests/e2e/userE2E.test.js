const request = require("supertest");
const app = require("../../app");

describe("E2E Test: GET /users", () => {
  it("should return a valid response from the running server", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.text).toBe("respond with a resource");
  });
});
