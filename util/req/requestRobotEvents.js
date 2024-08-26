const { default: axios } = require("axios");

const apiKey = process.env.ROBOTEVENTS_API_KEY;

const requestRobotEvents = async (url) => {
    return await axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );
}

module.exports = { requestRobotEvents }