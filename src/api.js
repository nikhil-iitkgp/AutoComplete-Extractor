const axios = require("axios");

const BASE_URL = "http://35.200.185.69:8000/v1/autocomplete";

/**
 * Fetch autocomplete suggestions from the API with retry logic.
 * @param {string} query - The search query string.
 * @param {number} retries - Number of retries on failure.
 * @returns {Promise<Array>} - List of autocomplete suggestions.
 */
const fetchNames = async (query, retries = 3) => {
    let delayMs = 2000; // Start with 2-second delay

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(`${BASE_URL}?query=${query}`);

            // Ensure response is an array
            return Array.isArray(response.data.results) ? response.data.results : [];
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn(`Rate limit exceeded for "${query}". Retrying in ${delayMs / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; // Exponential backoff
            } else {
                console.error(`Error fetching query "${query}":`, error.message);
                return []; // Return empty array on failure
            }
        }
    }

    return [];
};

module.exports = { fetchNames };
