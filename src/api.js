const axios = require("axios");

const BASE_URL = "http://35.200.185.69:8000/v1/autocomplete";

/**
 * Fetch autocomplete suggestions from the API.
 * @param {string} query - The search query string.
 * @returns {Promise<Array>} - List of autocomplete suggestions.
 */
const fetchNames = async (query) => {
    try {
        const response = await axios.get(`${BASE_URL}?query=${query}`);

        if (response.status === 200 && response.data.results) {
            console.log(`Fetched ${response.data.results.length} names for query "${query}"`);
            return response.data.results;
        }

        console.warn(`Unexpected API response format for query "${query}":`, response.data);
        return [];
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.warn(`Rate limit exceeded for query "${query}". Retrying after delay...`);
            await delay(5000); // Wait 5 seconds before retrying
            return fetchNames(query);
        }
        console.error(`Error fetching query "${query}":`, error.message);
        return [];
    }
};

module.exports = { fetchNames };
