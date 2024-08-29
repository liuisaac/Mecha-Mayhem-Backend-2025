const { getTeamInfo } = require("../req/getTeamInfo");

async function transformAwards(awards, year) {
    const transformedAwardsPromises = awards.map(async (award) => {
        const teamInfoPromises = award.teamWinners.map(async (teamWinner) => {
            const teamInfo = await getTeamInfo(teamWinner.team.name, year);
            return {
                award: award.title.replace(/\s*\(.*?\)/, ""),
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


module.exports = { transformAwards }