const admin = require("firebase-admin");
const { db } = require("../config/firebaseConfig");
const { yearToKeyMap } = require("../util/maps");
const { requestRobotEvents } = require("../util/req/requestRobotEvents");
const { transformAwards } = require("../util/transformers/transformAwards");
const overwriteCachedData = false;

const getAwardsByYear = async (req, res) => {
    const year = req.params.year;

    try {
        // Check if exists in FireStore Cache
        const awardsRef = db.collection("awards").doc(year);
        const doc = await awardsRef.get();

        if (doc.exists && !overwriteCachedData) {
            // Return cached data
            console.log("Returning cached awards data");
            res.json(doc.data().awards);
        } else {
            // Request from RobotEvents API and cache
            console.log("Fetching new awards data from API");
            const response = await requestRobotEvents(`https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/awards`);

            console.log(response);
            const awards = response.data.data;
            const transformedAwards = await transformAwards(awards, year);

            // Save to Firestore
            await awardsRef.set({
                awards: transformedAwards,
                timestamp: admin.firestore.FieldValue.serverTimestamp(), // Optionally, store a timestamp
            });

            res.json(transformedAwards);
        }
    } catch (error) {
        console.error("Error fetching awards:", error);
        res.status(500).json({ error: "Failed to fetch awards" });
    }
}

module.exports = { getAwardsByYear }