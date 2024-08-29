const { getTeamInfo } = require("../req/getTeamInfo");

// function that transforms raw match data to structured output
const transformMatches = async (matches, year, division) => {
    const transformedMatchesPromises = matches.map(async (match) => {
        if (match !== undefined && match !== null) {
            const redAlliancePromises = match.alliances[1].teams.map(
                async (team) => {
                    try {
                        const teamInfo = await getTeamInfo(team.team.name, year);
                        return { number: teamInfo.number, name: teamInfo.name };
                    } catch (error) {
                        return null;
                    }
                }
            );

            const blueAlliancePromises = match.alliances[0].teams.map(
                async (team) => {
                    const teamInfo = await getTeamInfo(team.team.name, year);
                    return { number: teamInfo.number, name: teamInfo.name };
                }
            );

            const redAlliance = await Promise.all(redAlliancePromises);
            const blueAlliance = await Promise.all(blueAlliancePromises);

            // Filter out null values from alliances
            const filteredRedAlliance = redAlliance.filter(
                (team) => team !== null
            );
            const filteredBlueAlliance = blueAlliance.filter(
                (team) => team !== null
            );

            return {
                isLive: false,
                matchNumber: match.name,
                matchType: division === "finals" ? "BEST OF 3" : "BEST OF 1",
                broadcast: "HS",
                division: division,
                status: "completed",
                season: year,
                redScore: match.alliances[1].score,
                blueScore: match.alliances[0].score,
                redAlliance: filteredRedAlliance,
                blueAlliance: filteredBlueAlliance,
            };
        }
    });

    const transformedMatches = await Promise.all(transformedMatchesPromises);
    return transformedMatches;
};

module.exports = { transformMatches };
