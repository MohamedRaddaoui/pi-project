var express = require("express");
var router = express.Router();
var sprintCtrl = require("../controllers/sprintProductController");
const {validateSprint,validateObjectId}= require('../middlewares/scrumValidator')


router.post('/createSprint/:id',sprintCtrl.createSprint)
router.get('/listOfSprint',sprintCtrl.getAllSprints)
router.get('/sprintById/:id',validateObjectId,sprintCtrl.getSprintById)
router.delete('/deleteSprint/:id',validateObjectId,sprintCtrl.deleteSprint)
router.put('/updateSprint/:id',validateObjectId,sprintCtrl.updateSprint)
router.get('/checkSprint',sprintCtrl.checkIfSprintIsLate)
router.get('/activeSprintByProject/:id',validateObjectId,sprintCtrl.getActiveSprintsByProject)
router.get('/sprintByProject/:id',sprintCtrl.getSprintByProject)
router.post('/assignUserStory/:sprintId/:userStoryId',sprintCtrl.addUserStoryToSprint)



module.exports=router