const Event = require("../../src/models/event.js"); // Mocked Model
const eventController = require("../../src/controllers/eventController.js"); // Import the controller

// Mocking the Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock("../../src/models/event.js"); // Mocking Mongoose Model

describe("Event Controller Unit Tests", () => {
  let res;

  beforeEach(() => {
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  test("should create an event successfully", async () => {
    const req = {
      body: { title: "Test Event", date: "2025-03-12", attendees: [] },
    };

    const eventMock = new Event(req.body); // Simulate Mongoose instance
    jest.spyOn(eventMock, "save").mockResolvedValue(req.body); // Mock save method

    await eventController.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event created successfully",
      event: req.body,
    });
  });

  test("should handle errors when creating an event", async () => {
    const req = { body: { title: "Test Event" } };

    Event.prototype.save = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    await eventController.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("should return all events", async () => {
    const req = {};
    const events = [{ title: "Event 1" }, { title: "Event 2" }];

    Event.find.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(events),
    });

    await eventController.getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(events);
  });

  test("should handle errors when fetching events", async () => {
    const req = {};

    Event.find.mockReturnValueOnce({
      populate: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    await eventController.getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("should return an event by ID", async () => {
    const req = { params: { id: "123" } };
    const event = { _id: "123", title: "Test Event" };

    Event.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(event),
    });

    await eventController.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(event);
  });

  test("should return 404 when event is not found", async () => {
    const req = { params: { id: "notfound" } };

    Event.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(null),
    });

    await eventController.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
  });

  test("should handle errors when getting an event by ID", async () => {
    const req = { params: { id: "123" } };

    Event.findById.mockReturnValueOnce({
      populate: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    await eventController.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("should update an event successfully", async () => {
    const req = { params: { id: "123" }, body: { title: "Updated Event" } };
    const updatedEvent = { _id: "123", title: "Updated Event" };

    Event.findByIdAndUpdate.mockResolvedValueOnce(updatedEvent);

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  });

  test("should return 404 when updating a non-existing event", async () => {
    const req = {
      params: { id: "notfound" },
      body: { title: "Updated Event" },
    };

    Event.findByIdAndUpdate.mockResolvedValueOnce(null);

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
  });

  test("should handle errors when updating an event", async () => {
    const req = { params: { id: "123" }, body: { title: "Updated Event" } };

    Event.findByIdAndUpdate.mockRejectedValueOnce(new Error("Database error"));

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("should delete an event successfully", async () => {
    const req = { params: { id: "123" } };

    Event.findByIdAndDelete.mockResolvedValueOnce({ _id: "123" });

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event deleted successfully",
    });
  });

  test("should return 404 when deleting a non-existing event", async () => {
    const req = { params: { id: "notfound" } };

    Event.findByIdAndDelete.mockResolvedValueOnce(null);

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
  });

  test("should handle errors when deleting an event", async () => {
    const req = { params: { id: "123" } };

    Event.findByIdAndDelete.mockRejectedValueOnce(new Error("Database error"));

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
