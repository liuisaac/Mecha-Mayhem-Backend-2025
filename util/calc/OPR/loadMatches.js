const fs = require('fs');
const { Alliance } = require('./Alliance');
const { Match } = require('./Match');

function loadMatches(filename) {
    const matches = [];

    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');

    let matchNum = 1;
    for (const line of lines) {
        const lineData = line.split(', ');
        const red1 = parseInt(lineData[0]);
        const red2 = parseInt(lineData[1]);
        const redscore = parseInt(lineData[2]);
        const redauto = parseInt(lineData[3]);
        const redAlliance = new Alliance(red1, red2, redscore, redauto, "Red");

        const blue1 = parseInt(lineData[4]);
        const blue2 = parseInt(lineData[5]);
        const bluescore = parseInt(lineData[6]);
        const blueauto = parseInt(lineData[7]);
        const blueAlliance = new Alliance(blue1, blue2, bluescore, blueauto, "Blue");

        matches.push(new Match(matchNum, redAlliance, blueAlliance));
        matchNum += 1;
    }

    return matches;
}

module.exports = { loadMatches }