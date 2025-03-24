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

        // Ensure response data is an array, otherwise return an empty array
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error fetching query "${query}":`, error.message);
        return []; // Return empty array on error
    }
};

module.exports = { fetchNames };
