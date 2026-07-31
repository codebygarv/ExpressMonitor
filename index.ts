import createMiddleware from './src/middleware.ts';
import type { ExpressLensOptions } from './src/middleware.ts';
import store from './src/store.ts';
import type { ExpressLensMetrics, Percentiles } from './src/store.ts';
import {
  prometheusHandler as createPrometheusHandler,
  getPrometheusMetrics as generatePrometheusMetrics,
} from './src/prometheus.ts';
import { dashboardHandler as createDashboardHandler } from './src/dashboard.ts';
import { generateCurl as buildCurl } from './src/utils.ts';
import type { RequestPayload } from './src/utils.ts';

/**
 * Express Monitor Middleware Factory
 * @param options Configuration options
 * @returns Express middleware function
 */
export default function monitor(options: ExpressLensOptions = {}): (req: any, res: any, next: any) => void {
  return createMiddleware(options);
}

/**
 * Get a JSON snapshot of all current metrics.
 * @returns Current metrics object
 */
export function getMetrics(): ExpressLensMetrics {
  return store.getMetrics();
}

/**
 * Calculate percentiles (p50, p90, p95, p99) for latency samples.
 * @param samples Optional latency samples array
 * @returns Percentiles object { p50, p90, p95, p99 }
 */
export function getPercentiles(samples?: number[]): Percentiles {
  return store.getPercentiles(samples);
}

/**
 * Reset all stored metrics to their initial state.
 */
export function resetMetrics(): void {
  store.reset();
}

/**
 * Express middleware route handler to serve metrics JSON over HTTP.
 * @returns Express request handler (req, res)
 */
export function metricsHandler(): (req: any, res: any) => void {
  return function (_req: any, res: any): void {
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
 * @returns Prometheus formatted string
 */
export function getPrometheusMetrics(): string {
  return generatePrometheusMetrics();
}

/**
 * Express middleware route handler to serve Prometheus format metrics over HTTP.
 * @returns Express request handler (req, res)
 */
export function prometheusHandler(): (_req: any, res: any) => void {
  return createPrometheusHandler();
}

/**
 * Express middleware route handler to serve the interactive web dashboard & SSE events stream.
 * @returns Express request handler (req, res, next)
 */
export function dashboardHandler(): (req: any, res: any, next: any) => void {
  return createDashboardHandler();
}

/**
 * Exports stored requests as a standard HTTP Archive (HAR 1.2) JSON object.
 * @param title Optional log title
 * @returns HAR 1.2 compliant log object
 */
export function exportHAR(title?: string): any {
  return store.exportHAR(title);
}

/**
 * Replays a previously captured HTTP request by its ID.
 * @param requestId Unique ID of the captured request
 * @param fetchFn Custom fetch implementation
 * @returns Execution result promise
 */
export function replayRequest(requestId: string, fetchFn?: any): Promise<any> {
  return store.replayRequest(requestId, fetchFn);
}

/**
 * Generates a cURL command string for an HTTP request object.
 * @param req Request payload { method, url, headers, body }
 * @returns Formatted cURL command
 */
export function generateCurl(req?: RequestPayload): string {
  return buildCurl(req);
}
