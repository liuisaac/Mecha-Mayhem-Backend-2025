const transformTeams = (teams) => {
    let temp = {};
    try {
        teams.map((team) => {
            if (team !== undefined) {
                teamData = {
                    id: team.id,
                    number: team.number,
                    name: team.team_name,
                    affiliation: team.organization,
                    location: `${team.location.city}, ${team.location.region}`,
                };

                temp[team.number] = teamData;
            }
        });
    } catch (error) {
        console.log("Bad team input");
        console.log(teams);
    }
    return temp;
};

module.exports = { transformTeams };
