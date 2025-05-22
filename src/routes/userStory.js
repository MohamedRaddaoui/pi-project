var express = require("express");
var router = express.Router();
var userStoryCtrl = require("../controllers/userStoryController");
const {validateUserStory,validateObjectId}=require ('../middlewares/scrumValidator')

router.post('/createUserStory',userStoryCtrl.createUserStory)
router.get('/listUserStory', userStoryCtrl.getAllUserStories)
router.put('/updateUserStory/:id',validateObjectId, userStoryCtrl.updateUserStory)
router.delete('/deleteUserStory/:id',validateObjectId,userStoryCtrl.deleteUserStory)
router.post('/assignUser', userStoryCtrl.assignUser)
router.get('/filter',userStoryCtrl.filterUserStories)
router.get('/statUser',userStoryCtrl.getStoryStats)
router.get('/storyPointTotal',userStoryCtrl.getTotalStoryPoints)
router.get('/userStoryBySprint/:id',validateObjectId,userStoryCtrl.getUserStoriesBySprint)
router.post('/unassignedUser',userStoryCtrl.unassignUser)
router.get('/getUserStoryByBacklog/:id',userStoryCtrl.getUserStoriesByBacklog)
router.put('/removeUserStory/:id',userStoryCtrl.removeUserStoryFromSprint)


module.exports=router