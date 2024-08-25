class Alliance {
    constructor(team1, team2, score, auto, col) {
        this.team1 = team1;
        this.team2 = team2;
        this.score = score;
        this.auto = auto;
        this.col = col;
        if (this.auto > this.score) {
            throw new Error("Autonomous score cannot be higher than Overall score.");
        }
    }

    toString() {
        return `${this.col} Alliance: ${this.team1}, ${this.team2}`;
    }
}

module.exports = { Alliance }