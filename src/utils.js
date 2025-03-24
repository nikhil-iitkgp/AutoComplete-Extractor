/**
 * Utility function to delay execution.
 * @param {number} ms - Time in milliseconds.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { delay };
