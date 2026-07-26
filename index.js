import trackRequest from './src/middleware.js';

/**
 * Express Monitor Middleware
 * @param {Object} options Configuration options
 * @returns {Function} Express middleware function
 */
export default function monitor(options = {}) {
  return function (req, res, next) {
    trackRequest(req, res, next, options);
  };
}
