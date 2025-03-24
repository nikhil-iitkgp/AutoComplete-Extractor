const { scrapeNames } = require("./src/scraper");

const API_VERSIONS = ["v1", "v2", "v3"];

/**
 * Runs the scraper for the specified API version.
 */
const run = async () => {
    const version = process.argv[2];

    if (!version || !API_VERSIONS.includes(version)) {
        console.error(`Usage: node index.js <version>`);
        console.error(`Valid versions: ${API_VERSIONS.join(", ")}`);
        process.exit(1);
    }

    console.log(`Starting scraper for ${version}...`);
    await scrapeNames(version);
    console.log(`Scraping completed for ${version}!`);
};

run();
