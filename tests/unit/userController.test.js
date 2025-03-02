import { sendResponse } from "../../src/controllers/userController";

describe("sendResponse function", () => {
  it("should send \"respond with a resource\"", () => {
    const req = {}; // Mock request
    const res = { send: jest.fn() }; // Mock response with a jest function
    const next = jest.fn(); // Mock next function

    sendResponse(req, res, next);

    expect(res.send).toHaveBeenCalledWith("respond with a resource");
  });
});
