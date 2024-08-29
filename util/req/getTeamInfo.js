const apiKey = process.env.ROBOTEVENTS_API_KEY;
const admin = require("firebase-admin");
const { db } = require("../../config/firebaseConfig");
const { default: axios } = require("axios");
const { concPagination } = require("./concPagination");
const { yearToKeyMap } = require("../maps");
const { transformTeams } = require("../transformers/transformTeams");

let teamCache = {}; // In-memory cache to minimize database calls
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60 ; // 1 hour

async function populateCache() {
    if (cacheTimestamp && Date.now() - cacheTimestamp <= CACHE_DURATION) {
        console.log("Cache is already populated and fresh.");
        return;
    }

    try {
        console.log("Populating cache...");
        for (const year of Object.keys(yearToKeyMap)) {
            if (!teamCache[year]) {
                console.log(`Fetching data for year ${year}...`);
                teamCache[year] = await getAllTeamsData(year);
            }
        }
        cacheTimestamp = Date.now();
        console.log("Cache fully populated.");
    } catch (error) {
        console.error("Error populating cache", error);
    }
}


async function getTeamInfo(teamNumber, year) {
    try {
        // Refresh cache if it's stale or empty
        if (!cacheTimestamp || Date.now() - cacheTimestamp > CACHE_DURATION) {
            console.log("Cache is stale or empty, populating...");
            await populateCache();
        }

        // Return data from cache if available
        if (teamCache[year] && teamCache[year][teamNumber]) {
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
