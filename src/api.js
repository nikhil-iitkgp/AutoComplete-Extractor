const axios = require("axios");

// Base URL for the autocomplete API
const BASE_URL = "http://35.200.185.69:8000/v1/autocomplete";

/**
 * Fetch autocomplete suggestions from the API.
 * @param {string} query - The search query string.
 * @returns {Promise<Array>} - List of autocomplete suggestions.
 */
const fetchNames = async (query) => {
    try {
        const response = await axios.get(`${BASE_URL}?query=${query}`);
        return response.data || [];  // Return results or empty array
    } catch (error) {
        console.error(`Error fetching query "${query}":`, error.message);
        return [];
    }
};

module.exports = { fetchNames };
