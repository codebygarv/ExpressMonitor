import createMiddleware from './src/middleware.js';
import store from './src/store.js';

/**
 * Express Monitor Middleware Factory
 * @param {Object} options Configuration options
 * @returns {Function} Express middleware function
 */
export default function monitor(options = {}) {
  return createMiddleware(options);
}

/**
 * Get a JSON snapshot of all current metrics.
 * @returns {Object} Current metrics object
 */
export function getMetrics() {
  return store.getMetrics();
}

/**
 * Reset all stored metrics to their initial state.
 */
export function resetMetrics() {
  store.reset();
}

/**
 * Express middleware route handler to serve metrics JSON over HTTP.
 * @returns {Function} Express request handler (req, res)
 */
export function metricsHandler() {
  return function (_req, res) {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.json === 'function') {
      res.json(getMetrics());
    } else if (typeof res.send === 'function') {
      res.send(JSON.stringify(getMetrics(), null, 2));
    } else if (typeof res.end === 'function') {
      res.end(JSON.stringify(getMetrics(), null, 2));
    }
  };
}
