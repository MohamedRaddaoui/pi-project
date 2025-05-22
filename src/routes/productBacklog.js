var express = require("express");
var router = express.Router();
var BacklogCtrl = require('../controllers/productBacklog')

const {validateBacklog,validateObjectId} = require ('../middlewares/scrumValidator')

router.post('/createBacklog/:id',BacklogCtrl.createProductBacklog)
router.get('/getAllBacklog',BacklogCtrl.getAllProductBacklogs)
router.get('/getBacklogById/:id',validateObjectId,BacklogCtrl.getProductBacklogById)
router.get('/getBacklogByProject/:id',BacklogCtrl.getProductBacklogsByProject)
router.put('/updateBacklog/:id',validateObjectId,BacklogCtrl.updateProductBacklog)
router.delete('/deleteBacklog/:id',validateObjectId,BacklogCtrl.deleteProductBacklog)


module.exports=router