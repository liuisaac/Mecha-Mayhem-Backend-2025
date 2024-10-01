const fs = require("fs").promises; // Using fs.promises for async file operations
const path = require("path");
const { concPagination } = require("./concPagination");
const { yearToKeyMap } = require("../maps");
const { transformTeams } = require("../transformers/transformTeams");

const CACHE_FILE_PATH = path.join(__dirname, "teamCache.json"); // Path to the cache file
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function loadCache() {
    try {
        const data = await fs.readFile(CACHE_FILE_PATH, "utf8");
        const { timestamp, teams } = JSON.parse(data);
        if (Date.now() - timestamp <= CACHE_DURATION) {
            console.log("Loaded cache from file.");
            return teams;
        } else {
            console.log("Cache is stale.");
            return null;
        }
    } catch (error) {
        console.error("Error loading cache from file:", error);
        return null;
    }
}

async function saveCache(teams) {
    const cacheData = {
        timestamp: Date.now(),
        teams,
    };
    try {
        await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheData), "utf8");
        console.log("Cache saved to file.");
    } catch (error) {
        console.error("Error saving cache to file:", error);
    }
}

async function populateCache() {
    const teams = {};
    console.log("Populating cache...");
    try {
        for (const year of Object.keys(yearToKeyMap)) {
            console.log(`Fetching data for year ${year}...`);
            teams[year] = await getAllTeamsData(year);
        }
        await saveCache(teams); // Save populated cache to file
    } catch (error) {
        console.error("Error populating cache", error);
    }
}

async function getTeamInfo(teamNumber, year) {
    try {
        let teamCache = await loadCache(); // Load cache from file
        if (!teamCache) {
            console.log("Cache is empty or stale, populating...");
            await populateCache(); // Populate cache if empty/stale
            teamCache = await loadCache(); // Load it again after populating
        }

        // Return data from cache if available
        if (teamCache && teamCache[year] && teamCache[year][teamNumber]) {
            return teamCache[year][teamNumber];
        } else {
            console.log("Team not found in cache");
            return null;
        }
    } catch (error) {
        console.error("Error fetching team info from cache", error);
    }
}

async function getAllTeamsData(year) {
    try {
        const teamData = await concPagination(
            `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/teams?myTeams=false`
        );
        return transformTeams(teamData);
    } catch (error) {
        console.error("Error fetching all teams data from API", error);
    }
}

module.exports = { getTeamInfo, getAllTeamsData };
