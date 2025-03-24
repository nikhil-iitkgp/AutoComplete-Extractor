const fs = require("fs");
const path = require("path");
const { fetchNames } = require("./api");
const { rateLimiter, delay } = require("./rateLimiter");

// Define API versions and their respective character sets and rate limits
const API_VERSIONS = {
    v1: { chars: "abcdefghijklmnopqrstuvwxyz", maxRequests: 100 },
    v2: { chars: "abcdefghijklmnopqrstuvwxyz0123456789", maxRequests: 50 },
    v3: { chars: "abcdefghijklmnopqrstuvwxyz0123456789+-.", maxRequests: 80 },
};

// Rate-limit API requests based on version constraints
const fetchNamesLimited = rateLimiter(fetchNames, API_VERSIONS.v1.maxRequests); // Change limit based on version

/**
 * Generates all possible 2-character query combinations.
 * @param {string} chars - Allowed character set.
 * @returns {string[]} - Array of query combinations.
 */
const generateQueries = (chars) => {
    const queries = [];
    for (let i = 0; i < chars.length; i++) {
        for (let j = 0; j < chars.length; j++) {
            queries.push(chars[i] + chars[j]);
        }
    }
    return queries;
};

/**
 * Scrapes names from the API for a given version and saves to file.
 * @param {string} version - API version (v1, v2, v3).
 */
const scrapeNames = async (version) => {
    const { chars, maxRequests } = API_VERSIONS[version];
    const queries = generateQueries(chars);
    const outputFile = path.join(__dirname, `../output/names_${version}.txt`);
    const namesSet = new Set();

    console.log(`Starting scraping for ${version} with ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
        if (i % maxRequests === 0 && i !== 0) {
            console.log(`Rate limit reached. Waiting for 1 minute...`);
            await delay(60000); // Wait for a minute to reset rate limit
        }

        const results = await fetchNamesLimited(queries[i]);
        results.forEach(name => namesSet.add(name));
        console.log(`Fetched ${results.length} names for query "${queries[i]}"`);
    }

    // Save results to file
    fs.writeFileSync(outputFile, Array.from(namesSet).join("\n"));
    console.log(`Scraping completed for ${version}. Results saved to ${outputFile}`);
};

module.exports = { scrapeNames };
