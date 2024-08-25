const express = require("express");
const { getAwardsByYear } = require("../controllers/awards-controller");
const router = express.Router();

// Route to retrieve awards by the year
router.get("/:year", getAwardsByYear);

module.exports = router;
