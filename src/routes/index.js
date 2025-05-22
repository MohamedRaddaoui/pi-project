const express = require("express");
const router = express.Router();
const qaRoutes = require("./qa.routes");


const userRoutes = require("./users");





// Use event routes
router.use("/users", userRoutes);

// Use user routes

router.use("/qa", qaRoutes);



module.exports = router;