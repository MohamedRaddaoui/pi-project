import { Router } from "express";
var router = Router();

/* GET home page. */
router.get("/", function (res) {
  res.send("Approved");
});

export default router;
