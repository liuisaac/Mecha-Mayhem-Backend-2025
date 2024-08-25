const fs = require('fs');

function loadTeams(filename) {
    const teams = {};

    const data = fs.readFileSync(filename, 'utf8');
    const lines = data.split('\n');

    for (const line of lines) {
        const lineData = line.split(', ');
        teams[parseInt(lineData[0])] = lineData[1].trim();
    }

    return teams;
}

module.exports = { loadTeams }