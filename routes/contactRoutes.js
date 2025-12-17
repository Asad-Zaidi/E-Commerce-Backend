const express = require("express");
const { getContact, updateContact } = require("../controllers/contactController");
const auth = require("../middlewares/authMiddleware");
const { verifyAdmin } = require("../middlewares/adminMiddleware");
const router = express.Router();

router.get("/", getContact);
router.put("/", auth, verifyAdmin, updateContact);

module.exports = router;
