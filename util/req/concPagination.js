const { removeDuplicates } = require("../transformers/removeDuplicates");
const { requestRobotEvents } = require("./requestRobotEvents");

// recursively concatenates paginated API results and removes duplicates
async function concPagination(url) {
    try {
        if (url !== null) {
            const response = await requestRobotEvents(url);
            const resMeta = response.data.meta;
            const resData = response.data.data;

            // Recursive call to fetch and concatenate the rest of the pages
            let concatenatedData = resData.concat(
                await concPagination(resMeta.next_page_url)
            );
            // Filter out undefined values
            concatenatedData = concatenatedData.filter(
                (item) => item !== undefined
            );
            // Remove duplicates from concatenated data
            concatenatedData = removeDuplicates(concatenatedData);

            return concatenatedData;
        }
    } catch (error) {
        console.error("Error fetching info from API:", error);
    }
}

module.exports = { concPagination };
