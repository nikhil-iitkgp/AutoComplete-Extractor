const axios = require("axios");
const { rateLimiter } = require("./rateLimiter");

const API_CONFIG = {
    v1: { url: "http://35.200.185.69:8000/v1/autocomplete", maxRequestsPerMinute: 100 },
    v2: { url: "http://35.200.185.69:8000/v2/autocomplete", maxRequestsPerMinute: 50 },
    v3: { url: "http://35.200.185.69:8000/v3/autocomplete", maxRequestsPerMinute: 80 }
};

/**
 * Fetch autocomplete results from the API with retries and rate limiting.
 * @param {string} query - The search query.
 * @param {string} version - API version (v1, v2, v3).
 * @returns {Promise<string[]>} - List of autocomplete results.
 */
const fetchNames = async (query, version) => {
    if (!API_CONFIG[version]) {
        console.error(`❌ Invalid API version: ${version}`);
        return [];
    }

    const apiUrl = `${API_CONFIG[version].url}?query=${query}`;
    const maxRetries = 5;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await axios.get(apiUrl, { timeout: 5000 });

            if (response.status === 200 && Array.isArray(response.data.results)) {
                console.log(`✅ Fetched ${response.data.results.length} names for query "${query}"`);
                return response.data.results;
            }

            console.warn(`⚠ Unexpected response format for query "${query}":`, response.data);
            return [];
        } catch (error) {
            if (error.response?.status === 429) {
                console.warn(`⏳ Rate limit hit for "${query}". Retrying (${retryCount + 1}/${maxRetries})...`);
                retryCount++;
                await new Promise(res => setTimeout(res, 1000 * retryCount)); // Exponential backoff
            } else {
                console.error(`❌ Error fetching "${query}":`, error.message);
                return [];
            }
        }
    }

    console.error(`❌ Max retries reached for "${query}". Skipping...`);
    return [];
};

// Apply adaptive rate limiting to each API version
const limitedFetchNames = {
    v1: rateLimiter((query) => fetchNames(query, "v1"), API_CONFIG.v1.maxRequestsPerMinute),
    v2: rateLimiter((query) => fetchNames(query, "v2"), API_CONFIG.v2.maxRequestsPerMinute),
    v3: rateLimiter((query) => fetchNames(query, "v3"), API_CONFIG.v3.maxRequestsPerMinute)
};

module.exports = { fetchNames: limitedFetchNames };
