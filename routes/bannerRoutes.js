const express = require("express");
const router = express.Router();
const { createBanner, getBanners, deleteBanner, toggleBannerStatus } = require("../controllers/bannerController");
const auth = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/adminMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Public Route — Show active banners on frontend
router.get("/active", async (req, res) => {
    const Banner = require("../models/Banner");
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(banners);
});


// ✅ Admin Routes
router.get("/all", auth, adminOnly, getBanners);
router.post("/", auth, adminOnly, upload.single("image"), createBanner);
router.delete("/:id", auth, adminOnly, deleteBanner);
router.put("/:id/toggle", auth, adminOnly, toggleBannerStatus);

module.exports = router;
