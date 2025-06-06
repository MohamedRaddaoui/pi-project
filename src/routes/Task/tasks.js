const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/Task/taskController");
const { validateTask, validateObjectId } = require("../../middlewares/validation");
const auth = require("../../middlewares/auth");

router.get("/socket-test", (req, res) => {
  res.render("socket-test");
});
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management API
 */

/**
 * @swagger
 * /tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 */

router.post("/create", auth, validateTask, taskController.createTask);

/**
 * @swagger
 * /tasks/getAll:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.get("/getAll",auth, taskController.getAllTasks);

/**
 * @swagger
 * /tasks/getbyId/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get("/getbyId/:id",auth, validateObjectId, taskController.getTaskById);

/**
 * @swagger
 * /tasks/update/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put("/update/:id", validateObjectId,auth, validateTask, taskController.updateTask);

/**
 * @swagger
 * /tasks/delete/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete("/delete/:id",auth, validateObjectId, taskController.deleteTask);

router.get("/filter", taskController.filterTasks);
router.put("/updateTaskAndSendEmail/:id",auth, taskController.updateTaskAndSendEmail);
//cette route est pour tester le socket io seulement à ne pas afficher sur le swagger
router.get("/socket-test",auth, taskController.renderSocketTestPage);
router.get("/taskhistory/:taskId",auth, taskController.getTaskHistoryById);

module.exports = router;
