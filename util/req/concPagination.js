const { requestRobotEvents } = require("./requestRobotEvents");

// recursively concatenates paginated API results
async function concPagination(url) {
    try {
        if (url !== null) {
            const response = await requestRobotEvents(url);
            const resMeta = response.data.meta;
            const resData = response.data.data;
    
            // base case
            if (resMeta.last_page_url == url) {
                return resData;
            } else {
                const concatenatedData = resData.concat(await concPagination(resMeta.next_page_url));
                // console.log(concatenatedData.length);
                return concatenatedData;
            }
        }
    } catch (error) {
        console.error("Error fetching info from API");
    }
}

module.exports = { concPagination };
