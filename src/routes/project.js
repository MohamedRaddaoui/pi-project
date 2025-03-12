var express = require("express");
var router = express.Router();
var projectCtrl = require("../controllers/projectController");



router.post("/AddProject",projectCtrl.addProject)  //Add new project
router.get("/ProjectByID/:id",projectCtrl.getProjectByID) //Get project by ID
router.get("/ListProject",projectCtrl.getAllProject) // Show all Project
router.put("/UpdateProject/:id", projectCtrl.updateProject)  //update Project
router.delete("/DeleteProject/:id",projectCtrl.deleteProject)  //Delete Project


module.exports = router;