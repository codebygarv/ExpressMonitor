const trackRequest = require('./src/middleware');

/**
 * Express Monitor Middleware
 * @param {Object} options Configuration options
 * @returns {Function} Express middleware function
 */
function monitor(options = {}) {
  return function (req, res, next) {
    trackRequest(req, res, next, options);
  };
}

module.exports = monitor;
