var express = require("express");
var router = express.Router();
var projectCtrl = require("../controllers/projectController");
const {
    validateProject,
    validateObjectId,

}= require("../middlewares/projectValidation");

// 📌 Add new project
router.post("/addProject",validateProject,projectCtrl.createProject);  
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

module.exports = router;