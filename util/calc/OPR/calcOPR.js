const math = require("mathjs");
const { loadMatches } = require("./loadMatches");
const { loadTeams } = require("./loadTeams");

const calcOPR = () => {
    const teams = loadTeams("./teams-robostorm4.3.txt");
    const matches = loadMatches("./matches-robostorm4.3.txt");

    let M = [];
    for (const match of matches) {
        let r = [];
        for (const team in teams) {
            r.push(
                match.redAlliance.team1 == team ||
                    match.redAlliance.team2 == team
                    ? 1
                    : 0
            );
        }
        M.push(r);

        let b = [];
        for (const team in teams) {
            b.push(
                match.blueAlliance.team1 == team ||
                    match.blueAlliance.team2 == team
                    ? 1
                    : 0
            );
        }
        M.push(b);
    }

    let Scores = [];
    let Autos = [];
    let Margins = [];
    for (const match of matches) {
        Scores.push([match.redAlliance.score]);
        Scores.push([match.blueAlliance.score]);
        Autos.push([match.redAlliance.auto]);
        Autos.push([match.blueAlliance.auto]);
        Margins.push([match.redAlliance.score - match.blueAlliance.score]);
        Margins.push([match.blueAlliance.score - match.redAlliance.score]);
    }

    M = math.matrix(M);
    Scores = math.matrix(Scores);
    Margins = math.matrix(Margins);

    const pseudoinverse = math.pinv(M);
    const OPRs = math.multiply(pseudoinverse, Scores);
    const CCWMs = math.multiply(pseudoinverse, Margins);

    function convertToList(statMatrix) {
        return statMatrix.toArray().map((val) => parseFloat(val.toFixed(3)));
    }

    let teamsList = [];
    let sortedOPR = [];
    let sortedCCWM = [];

    for (const team in teams) {
        teamsList.push(parseInt(team));
    }

    while (sortedTeams.length < teamsList.length) {
        const oprs = convertToList(OPRs);
        const autos = convertToList(AUTOs);
        const ccwms = convertToList(CCWMs);

        let bestTeam, bestOPR, bestAUTO, bestCCWM;
        for (let i = 0; i < teamsList.length; i++) {
            if (!sortedTeams.includes(teamsList[i])) {
                bestTeam = teamsList[i];
                bestOPR = oprs[i];
                bestAUTO = autos[i];
                bestCCWM = ccwms[i];
                break;
            }
        }

        for (let i = 0; i < teamsList.length; i++) {
            if (oprs[i] > bestOPR && !sortedTeams.includes(teamsList[i])) {
                bestTeam = teamsList[i];
                bestOPR = oprs[i];
                bestAUTO = autos[i];
                bestCCWM = ccwms[i];
            }
        }
        sortedTeams.push(bestTeam);
        sortedOPR.push(bestOPR);
        sortedAuto.push(bestAUTO);
        sortedCCWM.push(bestCCWM);
    }

    console.log("\nTEAM\t\tOPR\t\tAuto\t\tCCWM\t\tTeam Name");
    for (let i = 0; i < teamsList.length; i++) {
        const teamNum = sortedTeams[i];
        console.log(
            `Team ${teamNum}\t${sortedOPR[i]}\t\t${sortedAuto[i]}\t\t${sortedCCWM[i]}\t\t${teams[teamNum]}`
        );
    }
};

module.exports = { calcOPR };
