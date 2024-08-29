const { transformMatches } = require("../util/transformers/transformMatches");
const { yearToKeyMap, divToKeyMap } = require("../util/maps");
const { concPagination } = require("../util/req/concPagination");

const streamAllMatches = async (req, res) => {
    const year = req.params.year;
    const div = req.params.division;
    let matchLog = null;

    // An adjustment to the weird numbering system within RobotEvents
    const orderOfIteration = [1, 2, 6, 3, 4, 5];

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        for (const nextRoundType of orderOfIteration) {
            // Request from RobotEvents API
            const matches = await concPagination(
                `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/divisions/${divToKeyMap[div]}/matches?round%5B%5D=${nextRoundType}`
            );

            if (matches !== undefined && matches !== null) {
                for (const match of matches) {
                    if (match !== undefined && match !== null) {
                        const transformedMatch = await transformMatches(
                            [match],
                            year,
                            div
                        );
        
                        if (transformedMatch[0]) {
                            res.write(
                                `data: ${JSON.stringify(transformedMatch[0])}\n\n`
                            );
                            await new Promise((resolve) => setTimeout(resolve, 0)); // Simulate real-time streaming
                        }
                    }
                }
            }
        }

        // Close the connection when done
        res.end();
    } catch (error) {
        console.error("Error fetching matches", error);
        console.log("matchLog", matchLog);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};

const getAllMatches = async (req, res) => {
    const year = req.params.year;
    const div = req.params.division;

    // An adjustment to the weird numbering system within RobotEvents
    const orderOfIteration = [1, 2, 6, 3, 4, 5];

    // Array to hold all the matches
    let allMatches = [];

    try {
        for (const nextRoundType of orderOfIteration) {
            // Request from RobotEvents API
            const matches = await concPagination(
                `https://www.robotevents.com/api/v2/events/${yearToKeyMap[year]}/divisions/${divToKeyMap[div]}/matches?round%5B%5D=${nextRoundType}`
            );
            
            console.log(matches)

            if (matches !== undefined && matches !== null) {
                for (const match of matches) {
                    if (match !== undefined && match !== null) {
                        const transformedMatch = await transformMatches(
                            [match],
                            year,
                            div
                        );
        
                        if (transformedMatch[0]) {
                            allMatches.push(transformedMatch[0]);
                        }
                    }
                }
            }
        }

        // Send the accumulated matches as a single JSON response
        res.status(200).json(allMatches);
    } catch (error) {
        console.error("Error fetching matches", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
};

module.exports = { streamAllMatches, getAllMatches };
