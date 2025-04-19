const mongoose = require("mongoose"); // Import Mongoose

const Task = require("../../src/models/Task/task.js"); // Mocked Model
const taskController = require("../../src/controllers/Task/taskController.js"); // Import the controller

jest.mock("../../src/models/Task/task.js"); // Mocking Mongoose Model
 // Mocking the Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Task Controller Unit Tests", () => {
  let res;

  beforeEach(() => {
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  //  Create a Task
  test("Should create a task successfully", async () => {
    const req = {
      body: {
        title: "New Task",
        description: "This is a test task",
        status: "To Do",
        priority: "High",
        dueDate: "2025-03-20",
        projectId: new mongoose.Types.ObjectId().toString(),
        assignedUser: new mongoose.Types.ObjectId().toString(),
      },
    };

    const taskMock = { _id: "123", ...req.body };

    Task.prototype.save = jest.fn().mockResolvedValue(taskMock); // Mock save()
    Task.create.mockResolvedValue(taskMock); // Mock create()

    await taskController.createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Task created successfully",
      task: taskMock,
    });
  });

  // Test: Get All Tasks
  test("Should return all tasks", async () => {
    const tasksMock = [
      { _id: "123", title: "Task 1" },
      { _id: "456", title: "Task 2" },
    ];

    Task.find.mockResolvedValue(tasksMock);

    await taskController.getAllTasks({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ tasks: tasksMock });
  });

  // Test: Get a Single Task
  test("Should return a task by ID", async () => {
    const req = { params: { id: "123" } };
    const taskMock = { _id: "123", title: "Task 1" };

    Task.findById.mockResolvedValue(taskMock);

    await taskController.getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ task: taskMock });
  });

  // Test: Update a Task
  test("Should update a task", async () => {
    const req = {
      params: { id: "123" },
      body: { title: "Updated Task" },
    };

    const updatedTaskMock = { _id: "123", title: "Updated Task" };

    Task.findByIdAndUpdate.mockResolvedValue(updatedTaskMock);

    await taskController.updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({message: "Task updated successfully", task: updatedTaskMock });
  });

  // Test: Delete a Task
  test("Should delete a task", async () => {
    const req = { params: { id: "123" } };

    Task.findByIdAndDelete.mockResolvedValue({ _id: "123" });

    await taskController.deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Task deleted successfully" });
  });

  // Test: Get Non-Existing Task (Should return 404)
  test("Should return 404 for non-existing task", async () => {
    const req = { params: { id: "999" } };

    Task.findById.mockResolvedValue(null);

    await taskController.getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
  });
});
