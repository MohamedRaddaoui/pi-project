var express = require('express');
var router = express.Router();
var userCtrl = require('../controllers/userController.js');

/* GET users listing. */
router.get('/', userCtrl.sendResponse());

module.exports = router;
