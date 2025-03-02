import request from "supertest";
import server from "../../server"; // ✅ Import only the app, not the server

describe("E2E Test: GET /users", () => {
  it("should return a valid response from the running server", async () => {
    const response = await request(server).get("/users"); // ✅ Now it will work
    expect(response.status).toBe(200);
    expect(response.text).toBe("respond with a resource");
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
