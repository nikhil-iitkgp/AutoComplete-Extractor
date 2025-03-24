const { delay } = require("./utils");

/**
 * Rate limiter to manage API request frequency dynamically.
 * @param {Function} fn - The function to execute with rate limiting.
 * @param {number} limit - Maximum requests allowed per minute.
 * @returns {Function} - A wrapped function with rate limiting.
 */
const rateLimiter = (fn, limit) => {
    const interval = Math.ceil(60000 / limit); // Calculate interval dynamically
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

module.exports = { rateLimiter };
