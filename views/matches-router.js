const express = require("express");
const { getMatch } = require("../controllers/matches-controller");
const router = express.Router();

// Route to retrieve awards by the year
router.get("/:year/:division/:round/:matchNum", getMatch);

module.exports = router;
