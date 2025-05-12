var express = require("express");
var router = express.Router();
var projectCtrl = require("../controllers/projectController");
const {
    validateProject,
    validateObjectId,

}= require("../middlewares/projectValidation");

// 📌 Add new project
router.post("/addProject",projectCtrl.createProject); 

// 📌 Show project by ID
router.get("/projectByID/:id",validateObjectId,projectCtrl.getProjectByID); 
// 📌 Show all Project
router.get("/listProject",projectCtrl.getAllProject); 
// 📌 Update Project
router.put("/updateProject/:id",validateObjectId, projectCtrl.updateProject); 
// 📌 Delete project
router.delete("/deleteProject/:id", projectCtrl.deleteProjectAndTasks); 
// 📌 Assign user to Project
router.post("/assignUserToProject", projectCtrl.assignUserToProject); 
// 📌 Remove user from Project
router.delete("/removeMember/:projectId/:userId", projectCtrl.removeMemberFromProject); 
// 📌 Archived Project
router.put("/archiveProject/:id", projectCtrl.archiveProject);
// 📌 Restore Project
router.put("/restoreProject/:id",projectCtrl.restoreProject);
// 📌 Show list of archived project 
router.get("/getArchProject",projectCtrl.getAllArchivedProject);
// 📌 Show project by user 
router.get("/getProjectByUser/:id",projectCtrl.getProjectByUser);
// 📌 Delete tasks selected by Project
router.delete("/DeleteTaskByProject/:id", projectCtrl.deleteSomeTasksFromProject);
//

//Calculate progress project 
router.get("/calculateProgress/:id",projectCtrl.getProjectProgress)
//summury of task
router.get("/sumTask/:id",projectCtrl.getProjectTaskSummary)
router.get('/search',projectCtrl.searchProjects)

router.get('/checkProjectOverdue/:id',projectCtrl.checkProjectOverdue)






/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management API
 */

/**
 * @swagger
 * /project/addProject:
 *   post:
 *     summary: Add a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /project/projectByID/{id}:
 *   get:
 *     summary: Show a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/listProject:
 *   get:
 *     summary: Show all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */

/**
 * @swagger
 * /project/updateProject/{id}:
 *   put:
 *     summary: Update a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/deleteProject/{id}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/assignUserToProject:
 *   post:
 *     summary: Assign a user to a project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignUser'
 *     responses:
 *       200:
 *         description: User assigned to project successfully
 *       400:
 *         description: Invalid data
 */

/**
 * @swagger
 * /project/removeMember/{projectId}/{userId}:
 *   delete:
 *     summary: Remove a user from a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to remove
 *     responses:
 *       200:
 *         description: User removed from project successfully
 *       404:
 *         description: Project or user not found
 */

/**
 * @swagger
 * /project/archiveProject/{id}:
 *   put:
 *     summary: Archive a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to archive
 *     responses:
 *       200:
 *         description: Project archived successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/restoreProject/{id}:
 *   put:
 *     summary: Restore an archived project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the archived project to restore
 *     responses:
 *       200:
 *         description: Project restored successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/getArchProject:
 *   get:
 *     summary: Get all archived projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of archived projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */

/**
 * @swagger
 * /project/getProjectByUser/{id}:
 *   get:
 *     summary: Get projects by user ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of projects by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */

/**
 * @swagger
 * /project/DeleteTaskByProject/{id}:
 *   delete:
 *     summary: Delete tasks by project ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Tasks deleted successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /project/calculateProgress/{id}:
 *   get:
 *     summary: Calculate project progress
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Project progress calculated successfully
 */

/**
 * @swagger
 * /project/sumTask/{id}:
 *   get:
 *     summary: Get summary of tasks for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Task summary retrieved successfully
 */

/**
 * @swagger
 * /project/search:
 *   get:
 *     summary: Search for projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects matching search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */

module.exports = router;