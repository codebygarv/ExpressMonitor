import createMiddleware from './src/middleware.js';
import store from './src/store.ts';
import { prometheusHandler as createPrometheusHandler, getPrometheusMetrics as generatePrometheusMetrics } from './src/prometheus.js';
import { dashboardHandler as createDashboardHandler } from './src/dashboard.js';
import { generateCurl as buildCurl } from './src/utils.ts';

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
 * Calculate percentiles (p50, p90, p95, p99) for latency samples.
 * @param {number[]} [samples] Optional latency samples array
 * @returns {Object} Percentiles object { p50, p90, p95, p99 }
 */
export function getPercentiles(samples) {
  return store.getPercentiles(samples);
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

/**
 * Formats metrics in standard Prometheus exposition format text.
 * @returns {string} Prometheus formatted string
 */
export function getPrometheusMetrics() {
  return generatePrometheusMetrics();
}

/**
 * Express middleware route handler to serve Prometheus format metrics over HTTP.
 * @returns {Function} Express request handler (req, res)
 */
export function prometheusHandler() {
  return createPrometheusHandler();
}

/**
 * Express middleware route handler to serve the interactive web dashboard & SSE events stream.
 * @returns {Function} Express request handler (req, res)
 */
export function dashboardHandler() {
  return createDashboardHandler();
}

/**
 * Exports stored requests as a standard HTTP Archive (HAR 1.2) JSON object.
 * @param {string} [title] Optional log title
 * @returns {Object} HAR 1.2 compliant log object
 */
export function exportHAR(title) {
  return store.exportHAR(title);
}

/**
 * Replays a previously captured HTTP request by its ID.
 * @param {string} requestId - Unique ID of the captured request
 * @param {Function} [fetchFn] - Custom fetch implementation
 * @returns {Promise<Object>} Execution result
 */
export function replayRequest(requestId, fetchFn) {
  return store.replayRequest(requestId, fetchFn);
}

/**
 * Generates a cURL command string for an HTTP request object.
 * @param {Object} req - Request payload { method, url, headers, body }
 * @returns {string} Formatted cURL command
 */
export function generateCurl(req) {
  return buildCurl(req);
}
