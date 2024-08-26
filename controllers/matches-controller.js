const admin = require("firebase-admin");
const { db } = require("../config/firebaseConfig");
const { transformMatches } = require("../util/transformers/transformMatches");
const { yearToKeyMap, divToKeyMap, roundToKeyMap } = require("../util/maps");
const { concPagination } = require("../util/req/concPagination");

const overwriteCachedData = false;

// Route to retrieve awards by the year
const getAllMatches = async (req, res) => {
    const year = req.params.year;
    const div = req.params.division;

    // An adjustment to the weird numbering system within RobotEvents
    const orderOfIteration = [1, 2, 6, 3, 4, 5];

    try {
        // Request from RobotEvents API
        const promises = orderOfIteration.map((nextRoundType) =>
            concPagination(
                `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/divisions/${divToKeyMap[div]}/matches?round%5B%5D=${nextRoundType}`
            )
        );

        const matches = (await Promise.all(promises)).flat();
        const transformedMatches = await transformMatches(matches, year, div);
        console.log(transformedMatches);

        // Streaming the response
        res.setHeader("Content-Type", "application/json");
        res.write("[");

        // Stream each match object
        transformedMatches.forEach((match, index) => {
            if (index > 0) {
                res.write(",");
            }
            // Ensure match is not undefined
            if (match) {
                res.write(JSON.stringify(match));
            }
        });

        res.write("]");
        res.end();
    } catch (error) {
        console.error("Error fetching matches", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};

module.exports = { getAllMatches };
