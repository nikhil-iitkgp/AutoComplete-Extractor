const fs = require("fs");
const path = require("path");
const { fetchNames } = require("./api");
const { rateLimiter, delay } = require("./rateLimiter");

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
    const namesSet = new Set();

    console.log(`Starting scraping for ${version} with ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
        try {
            const results = await fetchNamesLimited(queries[i]);

            if (!Array.isArray(results)) {
                console.warn(`Unexpected response for query "${queries[i]}":`, results);
                continue;
            }

            results.forEach(name => namesSet.add(name));
            console.log(`Fetched ${results.length} names for query "${queries[i]}"`);
        } catch (error) {
            console.error(`Error fetching query "${queries[i]}":`, error.message);
        }
    }

    // Save results to file
    fs.writeFileSync(outputFile, Array.from(namesSet).join("\n"));
    console.log(`Scraping completed for ${version}. Results saved to ${outputFile}`);
};

module.exports = { scrapeNames };
