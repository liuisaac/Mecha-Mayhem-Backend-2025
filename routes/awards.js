const axios = require("axios");
const express = require("express");
const router = express.Router();

const admin = require('firebase-admin');
const { db } = require("../config/firebaseConfig");

const overwriteCachedData = false;

const apiKey = process.env.ROBOTEVENTS_API_KEY;

// Helpers
async function getTeamInfo(teamId, apiKey) {
    try {
        const response = await axios.get(
            `https://www.robotevents.com/api/v2/teams/${teamId}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );
        const teamInfo = response.data;
        return {
            number: teamInfo.number,
            name: teamInfo.team_name || "Unknown",
            affiliation: teamInfo.organization || "Unknown",
            location:
                teamInfo.location.city && teamInfo.location.region
                    ? `${teamInfo.location.city}, ${teamInfo.location.region}`
                    : "Unknown",
        };
    } catch (error) {
        return {
            number: "Unknown",
            name: "Unknown",
            affiliation: "Unknown",
            location: "Unknown",
        };
    }
}

async function transformAwards(awards, apiKey) {
    const transformedAwardsPromises = awards.map(async (award) => {
        const teamInfoPromises = award.teamWinners.map(async (teamWinner) => {
            const teamInfo = await getTeamInfo(teamWinner.team.id, apiKey);
            return {
                award: award.title.replace(/\s*\(.*?\)/, ''),
                team: teamInfo.number,
                name: teamInfo.name,
                affiliation: teamInfo.affiliation,
                location: teamInfo.location,
            };
        });
        return Promise.all(teamInfoPromises);
    });

    const transformedAwards = await Promise.all(transformedAwardsPromises);
    return transformedAwards.flat();
}

// Route to retrieve awards by the year
router.get("/:year", async (req, res) => {
    const year = req.params.year;

    const yearToKeyMap = {
        2023: 47800,
        2024: 51496,
    };

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
            console.log('Fetching new awards data from API');
            const response = await axios.get(
                `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/awards`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            const awards = response.data.data;
            const transformedAwards = await transformAwards(awards, apiKey);

            // Save to Firestore
            await awardsRef.set({
                awards: transformedAwards,
                timestamp: admin.firestore.FieldValue.serverTimestamp() // Optionally, store a timestamp
            });

            res.json(transformedAwards);
        }
    } catch (error) {
        console.error("Error fetching awards:", error);
        res.status(500).json({ error: "Failed to fetch awards" });
    }
});

module.exports = router;
