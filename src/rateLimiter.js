/**
 * Delay execution for a given amount of time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Rate limiter to manage API request frequency.
 * @param {Function} fn - The function to execute with rate limiting.
 * @param {number} limit - Maximum requests allowed per minute.
 * @returns {Function} - A wrapped function with rate limiting.
 */
const rateLimiter = (fn, limit) => {
    const interval = 60000 / limit; // Time gap between requests (in ms)
    let lastRequestTime = 0;

    return async (...args) => {
        const now = Date.now();
        const elapsedTime = now - lastRequestTime;

        if (elapsedTime < interval) {
            await delay(interval - elapsedTime); // Wait before making the next request
        }

        lastRequestTime = Date.now(); // Update last request time
        return fn(...args);
    };
};

module.exports = { delay, rateLimiter };
