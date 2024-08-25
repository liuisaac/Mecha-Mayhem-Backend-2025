const axios = require("axios");
const admin = require("firebase-admin");
const { db } = require("../config/firebaseConfig");
const { transformMatches } = require("../util/transformers/transformMatches");
const { calcMatch } = require("../util/calc/calcMatch");
const { yearToKeyMap, divToKeyMap, roundToKeyMap } = require("../util/maps");

const overwriteCachedData = false;
const apiKey = process.env.ROBOTEVENTS_API_KEY;

// Route to retrieve awards by the year
const getMatch = async (req, res) => {
    const year = req.params.year;
    const div = req.params.division;
    const round = req.params.round;
    const matchNum = req.params.matchNum;

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
            const matches = doc.data().matches;
            try {
                console.log("a: ", matches[0].redAlliance[0].number);
                const matchString = `${matches[0].redAlliance[0].number}, 
                                    ${matches[0].redAlliance[1].number}, 
                                    ${matches[0].redScore}, 
                                    0, 
                                    ${matches[0].blueAlliance[0].number}, 
                                    ${matches[0].blueAlliance[1].number}, 
                                    ${matches[0].blueScore}, 
                                    0`;
                calcMatch(year, div, matchString);
            } catch (error) {
                console.log("No more qual match data")
            }
            return res.json(matches);
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

        // // sotre data for later CCWM-related calculations
        // const matchString = `${transformedMatches.redAlliance[0]}, ${transformedMatches.redAlliance[1]}, ${transformedMatches.redScore}, 0, ${transformedMatches.blueAlliance[0]}, ${transformedMatches.blueAlliance[1]}, ${transformedMatches.blueScore}, 0`
        // calcMatch(year, div, matchString);

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
};

module.exports = { getMatch };
