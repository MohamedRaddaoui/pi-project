var express = require("express");
var router = express.Router();
var sprintCtrl = require("../controllers/sprintProductController");
const {validateSprint,validateObjectId}= require('../middlewares/scrumValidator')


router.post('/createSprint',validateSprint,sprintCtrl.createSprint)
router.get('/listOfSprint',sprintCtrl.getAllSprints)
router.get('/sprintById/:id',validateObjectId,sprintCtrl.getSprintById)
router.delete('/deleteSprint/:id',validateObjectId,sprintCtrl.deleteSprint)
router.post('/addDailyMeeting',sprintCtrl.addDailyMeeting)
router.post('/addRetrospective',sprintCtrl.addRetrospective)
router.post('/addReview',sprintCtrl.addReview)
router.put('/updateSprint/:id',validateObjectId,sprintCtrl.updateSprint)
router.get('/checkSprint',sprintCtrl.checkIfSprintIsLate)
router.get('/activeSprintByProject/:id',validateObjectId,sprintCtrl.getActiveSprintsByProject)



module.exports=router