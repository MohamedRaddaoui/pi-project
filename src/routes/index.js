var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (res) {
  res.send("Approved");
});

module.exports = router;
