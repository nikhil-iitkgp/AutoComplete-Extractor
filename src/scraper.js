const fs = require("fs");
const path = require("path");
const { fetchNames } = require("./api");
const { rateLimiter } = require("./rateLimiter");
const { delay } = require("./utils");

// Define API versions with their respective character sets and rate limits
const API_VERSIONS = {
    v1: { chars: "abcdefghijklmnopqrstuvwxyz", maxRequests: 100 },
    v2: { chars: "abcdefghijklmnopqrstuvwxyz0123456789", maxRequests: 50 },
    v3: { chars: "abcdefghijklmnopqrstuvwxyz0123456789+-.", maxRequests: 80 },
};

// Rate-limit API requests based on version constraints
const fetchNamesLimited = rateLimiter(fetchNames, API_VERSIONS.v1.maxRequests);

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
    const errorLogFile = path.join(__dirname, `../output/errors_${version}.log`);

    const namesSet = new Set();
    let failedQueries = [];

    console.log(`Starting scraping for ${version} with ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
        if (i % maxRequests === 0 && i !== 0) {
            console.log(`Rate limit reached. Waiting for 1 minute...`);
            await delay(60000); // Wait for a minute to reset rate limit
        }

        const results = await fetchNamesLimited(queries[i]);

        if (!Array.isArray(results)) {
            console.warn(`Unexpected response for query "${queries[i]}":`, results);
            failedQueries.push(queries[i]);
            continue;
        }

        if (results.length > 0) {
            results.forEach(name => namesSet.add(name));
            console.log(`Fetched ${results.length} names for query "${queries[i]}"`);
        } else {
            failedQueries.push(queries[i]);
        }
    }

    // Save results to file
    fs.writeFileSync(outputFile, Array.from(namesSet).join("\n"));
    console.log(`Scraping completed for ${version}. Results saved to ${outputFile}`);

    // Log failed queries for debugging
    if (failedQueries.length > 0) {
        fs.writeFileSync(errorLogFile, failedQueries.join("\n"));
        console.warn(`Some queries failed. Check ${errorLogFile} for details.`);
    }
};

module.exports = { scrapeNames };
