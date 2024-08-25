class Match {
    constructor(num, redAlliance, blueAlliance) {
        this.num = num;
        this.redAlliance = redAlliance;
        this.blueAlliance = blueAlliance;
    }

    toString() {
        return `Match # ${this.num}: (${this.redAlliance.team1} & ${this.redAlliance.team2}) ${this.redAlliance.score} - ${this.blueAlliance.score} (${this.blueAlliance.team1} & ${this.blueAlliance.team2})`;
    }
}

module.exports = { Match }