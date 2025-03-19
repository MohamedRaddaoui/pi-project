var express = require("express");
var router = express.Router();
var projectCtrl = require("../controllers/projectController");
const {
    validateProject,
    validateObjectId,

}= require("../middlewares/projectValidation");


router.post("/AddProject",validateProject,projectCtrl.createProject);  //Add new project
router.get("/ProjectByID/:id",validateObjectId,projectCtrl.getProjectByID); //Get project by ID
router.get("/ListProject",projectCtrl.getAllProject); // Show all Project
router.put("/UpdateProject/:id",validateObjectId, projectCtrl.updateProject);  //update Project
router.delete("/DeleteProject/:id",validateObjectId,projectCtrl.deleteProject);  //Delete Project


module.exports = router;