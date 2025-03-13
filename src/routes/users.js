var express = require("express");
var router = express.Router();
var usercontroller = require("../controllers/userController.js");

/* GET users listing. */


router.post("/adduser", usercontroller.adduser);

router.get("/showuser",usercontroller.showuser);

router.delete("/deleteuser/:id",usercontroller.deleteuser);

router.put("/updateuser/:id", usercontroller.updateuser);

module.exports = router;


