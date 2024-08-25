const yearToKeyMap = {
    2023: 47800,
    2024: 51496,
};

const divToKeyMap = {
    prairies: 1,
    rockies: 2,
    finals: 100,
};

const roundToKeyMap = {
    practice: "round%5B%5D=1",
    qualification: "round%5B%5D=2",
    eliminations: "round%5B%5D=3&round%5B%5D=4&round%5B%5D=5&round%5B%5D=6",
};

const gradeToKeyMap = {
    MS: "&grade%5B%5D=Middle%20School&myTeams=false",
    HS: "&grade%5B%5D=High%20School&myTeams=false",
    UNI: "&grade%5B%5D=College&myTeams=false",
};

module.exports = { yearToKeyMap, divToKeyMap, roundToKeyMap, gradeToKeyMap }