const express = require("express");
const { getInfo, getOPR, getAllTeams, getOneTeam } = require("../controllers/teams-controller");
const router = express.Router();

// route to retrieve team information for a season
router.get("/info/:teamNumber/:grade/:year", getInfo);

// route to retrieve team information for a season
router.get("/info/:year", getAllTeams);

// route to retrieve team information for a season
router.get("/info/:number/:year", getOneTeam);

// retrieve a teams OPR for a season
router.get("/opr/:teamNumber/:year/:division", getOPR);

module.exports = router;
