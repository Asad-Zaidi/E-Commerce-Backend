const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const adminOnly  = require("../middlewares/adminMiddleware");

// Public route
router.get("/", homeController.getHomeSections);

// Admin route
router.post("/update", adminOnly, homeController.updateHomeSections);

module.exports = router;
