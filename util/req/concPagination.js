const { default: axios } = require("axios");

const apiKey = process.env.ROBOTEVENTS_API_KEY;

// recursively concatenates paginated API results
async function concPagination(url) {
    try {
        console.log(url);
        const response = await axios.get(
            url,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );
        const resMeta = response.data.meta;
        const resData = response.data.data;

        // base case
        if (resMeta.last_page_url == url) {
            return resData;
        } else {
            const concatenatedData = resData.concat(await concPagination(resMeta.next_page_url));
            console.log(concatenatedData.length);
            return concatenatedData;
        }
    } catch (error) {
        console.error("Error fetching info from API", error);
    }
}

module.exports = { concPagination };
