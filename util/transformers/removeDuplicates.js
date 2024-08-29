// Helper function to remove duplicates
const removeDuplicates = (arr) => {
    const uniqueSet = new Set(arr.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item));
}

module.exports = { removeDuplicates }