const express = require("express");
const router = express.Router();
const { transformMatches } = require("../util/transformers/transformMatches");
const { default: axios } = require("axios");

const apiKey = process.env.ROBOTEVENTS_API_KEY;

// route to retrieve team information for a season
router.get("/:teamNumber/:grade/:year", async (req, res) => {
    const teamNumber = req.params.teamNumber;
    const grade = req.params.grade;
    const year = req.params.year;

    const yearToKeyMap = {
        2023: 47800,
        2024: 51496,
    };

    const gradeToKeyMap = {
        MS: "&grade%5B%5D=Middle%20School&myTeams=false",
        HS: "&grade%5B%5D=High%20School&myTeams=false",
        UNI: "&grade%5B%5D=College&myTeams=false",
    };

    // construct the URL based on the team number, grade, and year
    try {
        const url = `https://www.robotevents.com/api/v2/teams?number%5B%5D=${teamNumber}${gradeToKeyMap[grade]}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (response.data.data[0] !== undefined) {
            const team_id = response.data.data[0].id;
            const team_name = response.data.data[0].team_name;
            const matchRes = await axios.get(
                `https://www.robotevents.com/api/v2/teams/${team_id}/matches?event%5B%5D=${yearToKeyMap[year]}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );
            if (matchRes.data.data[0] !== undefined) {
                const team_div =
                    matchRes.data.data[0].division.name.toLowerCase();
                const matches = matchRes.data.data;
                const transformedMatches = await transformMatches(
                    matches,
                    year,
                    team_div
                );

                const rankingRes = await axios.get(
                    `https://www.robotevents.com/api/v2/teams/${team_id}/rankings?event%5B%5D=${yearToKeyMap[year]}`,
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                        },
                    }
                );

                const rank = rankingRes.data.data[0].rank;
                const wins = rankingRes.data.data[0].wins;
                const losses = rankingRes.data.data[0].losses;
                const ties = rankingRes.data.data[0].ties;
                const wp = rankingRes.data.data[0].wp;
                const ap = rankingRes.data.data[0].ap;
                const sp = rankingRes.data.data[0].sp;
                const high = rankingRes.data.data[0].high_score;
                const avg = rankingRes.data.data[0].average_points;
                const total = rankingRes.data.data[0].total_points;

                res.json({
                    team_number: teamNumber,
                    team_name: team_name,
                    matches: transformedMatches,
                    rank: rank,
                    wins: wins,
                    losses: losses,
                    ties: ties,
                    wp: wp,
                    ap: ap,
                    sp: sp,
                    high: high,
                    avg: avg,
                    total: total,
                });
            } else {
                res.status(404).json({ error: `No team data for ${year}` });
            }
        } else {
            res.status(404).json({ error: "Team not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
