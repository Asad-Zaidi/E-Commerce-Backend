const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const { adminOnly } = require("../middlewares/adminMiddleware");
const auth = require("../middlewares/authMiddleware");

// Public route
router.get("/", homeController.getHomeSections);

// Admin route
router.put("/", auth, adminOnly, homeController.updateHomeSections);
router.post("/generate-intro", auth, adminOnly, homeController.generateIntroAI);

module.exports = router;
