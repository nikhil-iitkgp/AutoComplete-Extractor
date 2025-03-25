const { scrapeNames } = require("./src/scraper");

const API_VERSIONS = ["v1", "v2", "v3"];

/**
 * Runs the scraper for all API versions if no version is specified,
 * otherwise, runs for a single specified version.
 */
const run = async () => {
    const version = process.argv[2];

    if (version && !API_VERSIONS.includes(version)) {
        console.error(`❌ Invalid usage!`);
        console.error(`Usage: node index.js [version]`);
        console.error(`Valid versions: ${API_VERSIONS.join(", ")}`);
        process.exit(1);
    }

    if (version) {
        console.log(`🚀 Starting scraper for ${version}...`);
        try {
            await scrapeNames(version);
            console.log(`✅ Scraping completed for ${version}!`);
        } catch (error) {
            console.error(`❌ Scraper encountered an error:`, error);
        }
    } else {
        console.log("🚀 Running scraper for all API versions...");
        try {
            await Promise.all(API_VERSIONS.map(scrapeNames));
            console.log("✅ Scraping completed for all versions!");
        } catch (error) {
            console.error(`❌ Scraper encountered an error:`, error);
        }
    }
};

run();
