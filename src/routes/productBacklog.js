var express = require("express");
var router = express.Router();
var BacklogCtrl = require('../controllers/productBacklog')

const {validateBacklog,validateObjectId} = require ('../middlewares/scrumValidator')

router.post('/createBacklog',validateBacklog,BacklogCtrl.createProductBacklog)
router.get('/getAllBacklog',BacklogCtrl.getAllProductBacklogs)
router.get('/getBacklogById/:id',validateObjectId,BacklogCtrl.getProductBacklogById)
router.put('/updateBacklog/:id',validateObjectId,BacklogCtrl.updateProductBacklog)
router.delete('/deleteBacklog/:id',validateObjectId,BacklogCtrl.deleteProductBacklog)


module.exports=router