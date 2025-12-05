const express = require("express");
const { getContact, updateContact } = require("../controllers/contactController");
const router = express.Router();

router.get("/", getContact);
router.put("/", updateContact);

module.exports = router;
