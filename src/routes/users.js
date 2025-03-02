import { Router } from "express";
var router = Router();
import { sendResponse } from "../controllers/userController.js";

/* GET users listing. */
router.get("/", sendResponse);

export default router;
