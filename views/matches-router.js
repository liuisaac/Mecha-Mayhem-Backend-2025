const express = require("express");
const { getAllMatches, getNextMatches } = require("../controllers/matches-controller");
const router = express.Router();

// Route to retrieve awards by the year
router.get("/:year/:division/", getAllMatches);

module.exports = router;
