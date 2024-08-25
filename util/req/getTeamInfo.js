const apiKey = process.env.ROBOTEVENTS_API_KEY;
const admin = require("firebase-admin");
const { db } = require("../../config/firebaseConfig");
const { default: axios } = require("axios");

async function getTeamInfo(teamId, year) {
    try {
        // check firestore cache for cached team data
        const teamRef = db.collection("teams").doc(year);
        const doc = await teamRef.get();

        let teamData = null;

        if (doc.exists) {
            const teams = doc.data().teams;
            if (Array.isArray(teams)) {
                // find team document via linear search of team number
                teamData = teams.find((team) => team.id === teamId);
            } else {
                console.error("Cached teams data is not an array", teams);
            }
        }

        if (teamData) {
            console.log("Returning cached team data: ", teamId);
            return teamData; // return cached team data if found
        } else {
            // if not found in cache, fetch new team data from API
            console.log("Fetching new team data: ", teamId);

            // making robotevents api request
            const response = await axios.get(
                `https://www.robotevents.com/api/v2/teams/${teamId}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );
            const teamInfo = response.data;

            // format team data
            teamData = {
                id: teamId,
                number: teamInfo.number,
                name: teamInfo.team_name || "Unknown",
                affiliation: teamInfo.organization || "Unknown",
                location:
                    teamInfo.location.city && teamInfo.location.region
                        ? `${teamInfo.location.city}, ${teamInfo.location.region}`
                        : "Unknown",
            };

            // save team data to firestore db
            await db
                .collection("teams")
                .doc(year)
                .set(
                    {
                        teams: admin.firestore.FieldValue.arrayUnion(teamData),
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

            return teamData;
        }
    } catch (error) {
        console.error("Error fetching team info from API", error);
        // check if the error is a 419 (Too Many Requests) and if we can retry
        // robotevents api is a pain in the ass
        if (error.response && error.response.status === 419) {
            console.log(
                "419 (Too many requests). Likely RobotEvents API Request Limiter. Wait ~5 minutes and try again"
            );
        }
        return null; // Return null for failed requests
    }
}

module.exports = { getTeamInfo };
