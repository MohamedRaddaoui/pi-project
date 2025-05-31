var express = require("express");
var router = express.Router();
var userStoryCtrl = require("../controllers/userStoryController");
const {validateUserStory,validateObjectId}=require ('../middlewares/scrumValidator')

router.post('/createUserStory',userStoryCtrl.createUserStory)
router.get('/listUserStory', userStoryCtrl.getAllUserStories)
router.put('/updateUserStory/:id',validateObjectId, userStoryCtrl.updateUserStory)
router.delete('/deleteUserStory/:id',validateObjectId,userStoryCtrl.deleteUserStory)
router.put('/assignUser/:id', userStoryCtrl.assignUser)
router.get('/filter',userStoryCtrl.filterUserStories)
router.get('/statUser',userStoryCtrl.getStoryStats)
router.get('/storyPointTotal',userStoryCtrl.getTotalStoryPoints)
router.get('/userStoryBySprint/:id',validateObjectId,userStoryCtrl.getUserStoriesBySprint)
router.put('/unassignedUser/:id',userStoryCtrl.unassignUser)
router.get('/getUserStoryByBacklog/:id',userStoryCtrl.getUserStoriesByBacklog)
router.put('/removeUserStory/:id',userStoryCtrl.removeUserStoryFromSprint)
router.patch('/remove-from-backlog/:id', userStoryCtrl.removeUserStoryFromBacklog);
router.post('/addUserStoryToBacklog',userStoryCtrl.addUserStoryToBacklog);
router.put('/removeUserStoryFromSprintEX/:id',userStoryCtrl.removeUserStoryFromSprintEX);


module.exports=router