const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Adaptive rate limiter for API requests.
 * @param {Function} fn - The function to wrap (API request function).
 * @param {number} maxRequestsPerMinute - Max API requests per minute for this version.
 * @returns {Function} - Rate-limited function.
 */
const rateLimiter = (fn, maxRequestsPerMinute) => {
    const baseWaitTime = 60000 / maxRequestsPerMinute; // Initial wait time per request
    let lastRequestTime = 0;
    let dynamicWaitTime = baseWaitTime; // Adaptive wait time

    return async (...args) => {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;

        // Enforce wait time before making the next request
        if (lastRequestTime && timeSinceLastRequest < dynamicWaitTime) {
            const waitTime = dynamicWaitTime - timeSinceLastRequest;
            console.log(`⏳ Waiting ${waitTime.toFixed(0)}ms before next request...`);
            await delay(waitTime);
        }

        try {
            lastRequestTime = Date.now();
            const response = await fn(...args);

            // Reduce wait time slightly if requests are successful
            dynamicWaitTime = Math.max(baseWaitTime * 0.9, baseWaitTime / 2);
            return response;
        } catch (error) {
            if (error.response?.status === 429) {
                dynamicWaitTime *= 1.5; // Increase wait time if rate limited
                console.warn(`⚠ Rate limit hit! Increasing delay to ${dynamicWaitTime.toFixed(0)}ms and retrying...`);
                await delay(dynamicWaitTime);
                return await fn(...args); // Retry the request
            } else {
                throw error; // Allow non-429 errors to fail normally
            }
        }
    };
};

module.exports = { delay, rateLimiter };
