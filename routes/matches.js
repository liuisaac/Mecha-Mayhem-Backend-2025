const express = require("express");
const router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");
const { db } = require("../config/firebaseConfig");
const { transformMatches } = require("../util/transformers/transformMatches");

const overwriteCachedData = false;
const apiKey = process.env.ROBOTEVENTS_API_KEY;

// Route to retrieve awards by the year
router.get("/:year/:division/:round/:matchNum", async (req, res) => {
    const year = req.params.year;
    const div = req.params.division;
    const round = req.params.round;
    const matchNum = req.params.matchNum;

    const yearToKeyMap = {
        2023: 47800,
        2024: 51496,
    };

    const divToKeyMap = {
        prairies: 1,
        rockies: 2,
        finals: 100,
    };

    const roundToKeyMap = {
        practice: "round%5B%5D=1",
        qualification: "round%5B%5D=2",
        eliminations: "round%5B%5D=3&round%5B%5D=4&round%5B%5D=5&round%5B%5D=6",
    };

    let matchNumKey = `&matchnum%5B%5D=${matchNum}`;

    try {
        if (!year || !div) {
            console.error(
                `Invalid year or division: year=${year}, division=${div}`
            );
            res.status(400).json({ error: "Invalid year or division" });
            return;
        }

        // Check if exists in FireStore Cache
        const matchesRef = db
            .collection("matches")
            .doc(
                `${String(year)}-${String(div)}-${String(round)}#${String(
                    matchNum
                )}`
            );
        const doc = await matchesRef.get();

        if (doc.exists && !overwriteCachedData) {
            // Return cached data
            console.log("Returning cached match data");
            return res.json(doc.data().matches);
        }

        // Request from RobotEvents API
        console.log("Fetching new match data from API");
        const response = await axios.get(
            `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/divisions/${divToKeyMap[div]}/matches?${roundToKeyMap[round]}${matchNumKey}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        const matches = response.data.data;
        const transformedMatches = await transformMatches(matches, year, div);

        // Save matches to Firestore
        await matchesRef.set({
            matches: transformedMatches,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json(transformedMatches);
    } catch (error) {
        console.error("Error fetching matches", error);

        // Handle 429 error by checking the cache
        if (error.response && error.response.status === 429) {
            console.log(
                "Received 429 error, returning cached data if available"
            );

            const matchesRef = db.collection("matches").doc(String(year));
            const doc = await matchesRef.get();

            if (doc.exists) {
                console.log("Returning cached match data after 429 error");
                return res.json(doc.data().matches);
            }
        }

        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

module.exports = router;
