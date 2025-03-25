const fs = require("fs");
const path = require("path");
const { fetchNames } = require("./api");

const API_VERSIONS = {
    v1: { chars: "abcdefghijklmnopqrstuvwxyz", maxResultsPerRequest: 10 },
    v2: { chars: "0123456789abcdefghijklmnopqrstuvwxyz", maxResultsPerRequest: 12 },
    v3: { chars: ' +-.0123456789abcdefghijklmnopqrstuvwxyz', maxResultsPerRequest: 15 }
};

// **Dynamic Rate Limit Handling**
const BASE_DELAY = 300; // Initial delay (ms)
let currentDelay = BASE_DELAY;
let totalRequests = 0; // Track total requests

/**
 * Fetch names with rate limit handling
 * @param {string} query - Query string
 * @param {string} version - API version
 * @returns {Promise<string[]>} - Fetched names
 */
const fetchNamesWithRateLimit = async (query, version) => {
    try {
        // Enforce delay to avoid exceeding rate limit
        await new Promise(res => setTimeout(res, currentDelay));

        const startTime = Date.now();
        const results = await fetchNames[version](query);
        const endTime = Date.now();

        totalRequests++; // Increment request count

        // Adjust delay based on API response time
        const responseTime = endTime - startTime;
        if (responseTime > 500) {
            currentDelay += 100; // Increase delay if API is slow
        } else if (currentDelay > BASE_DELAY) {
            currentDelay -= 50; // Decrease delay if API is fast
        }

        return results;
    } catch (error) {
        if (error.message.includes("Rate limit hit")) {
            console.warn(`⏳ Rate limit hit for "${query}". Increasing delay...`);
            currentDelay += 500; // Increase delay if rate limit is hit
        } else {
            console.warn(`⚠ Error fetching "${query}". Skipping...`);
        }
    }
    return [];
};

/**
 * Scrapes names from the API for a given version and saves to a file.
 * @param {string} version - API version (v1, v2, v3).
 */
const scrapeNames = async (version) => {
    if (!API_VERSIONS[version]) {
        console.error(`❌ Invalid API version: ${version}`);
        return;
    }

    const { chars, maxResultsPerRequest } = API_VERSIONS[version];
    const outputFilePath = path.join(__dirname, `../output/names_${version}.txt`);
    const namesSet = new Set();
    const attemptedQueries = new Set();
    const queryQueue = [];

    console.log(`🚀 Starting optimized scraping for ${version}...`);

    // Load existing data to avoid duplicate entries
    if (fs.existsSync(outputFilePath)) {
        const existingNames = fs.readFileSync(outputFilePath, "utf8").split("\n");
        existingNames.forEach(name => namesSet.add(name.trim()));
    }

    // Initialize queue with two-character queries
    for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '+' || chars[i] === '-' || chars[i] === '.' || chars[i] === ' ') continue;
        for (let j = 0; j < chars.length; j++) {
            queryQueue.push(chars[i] + chars[j]);
        }
    }

    while (queryQueue.length > 0) {
        const query = queryQueue.shift();
        if (attemptedQueries.has(query)) continue;
        attemptedQueries.add(query);

        let results = await fetchNamesWithRateLimit(query, version);
        if (!Array.isArray(results) || results.length === 0) continue;

        results.forEach(name => namesSet.add(name.trim()));
        console.log(`✅ Saved ${results.length} names from query "${query}"`);

        // **Expand query immediately if max results reached**
        if (results.length >= maxResultsPerRequest) {
            const lastItem = results[results.length - 1];
            let startChar = lastItem[2] || "a"; // If third character is missing, start from "a"
            let startIndex = chars.indexOf(startChar);
            if (startIndex === -1) startIndex = 0;

            console.log(`🔄 Expanding query "${query}" from "${startChar}" to "${chars[chars.length - 1]}"`);

            // **Process expanded queries immediately**
            for (let i = startIndex; i < chars.length; i++) {
                let newQuery = query + chars[i];
                if (!attemptedQueries.has(newQuery)) {
                    console.log(`⚡ Immediately processing expanded query: "${newQuery}"`);
                    let newResults = await fetchNamesWithRateLimit(newQuery, version);
                    if (newResults.length > 0) {
                        newResults.forEach(name => namesSet.add(name.trim()));
                        console.log(`✅ Fetched ${newResults.length} names for query "${newQuery}"`);
                    }
                }
            }
        }
    }

    // Save results to file
    fs.writeFileSync(outputFilePath, Array.from(namesSet).join("\n"));
    console.log(`✅ Optimized scraping completed for ${version}. Results saved to ${outputFilePath}`);
    console.log(`📊 Total API requests made: ${totalRequests}`);
};

module.exports = { scrapeNames };

