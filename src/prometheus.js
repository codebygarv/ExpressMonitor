import store from './store.ts';

/**
 * Formats Express Lens metrics into standard Prometheus Exposition text format (v0.0.4).
 * @returns {string} Prometheus formatted metrics string
 */
export function getPrometheusMetrics() {
  const metrics = store.getMetrics();
  const lines = [];

  lines.push('# HELP http_requests_total Total number of HTTP requests processed');
  lines.push('# TYPE http_requests_total counter');
  lines.push(`http_requests_total ${metrics.totalRequests}`);

  lines.push('\n# HELP http_request_errors_total Total number of HTTP request errors (status >= 400)');
  lines.push('# TYPE http_request_errors_total counter');
  lines.push(`http_request_errors_total ${metrics.totalErrors}`);

  lines.push('\n# HELP http_request_duration_milliseconds_avg Average HTTP request duration in milliseconds');
  lines.push('# TYPE http_request_duration_milliseconds_avg gauge');
  lines.push(`http_request_duration_milliseconds_avg ${metrics.avgDurationMs}`);

  // Quantiles / Percentiles
  lines.push('\n# HELP http_request_duration_seconds Summary of HTTP request durations in seconds');
  lines.push('# TYPE http_request_duration_seconds summary');
  lines.push(`http_request_duration_seconds{quantile="0.5"} ${((metrics.percentiles.p50 || 0) / 1000).toFixed(6)}`);
  lines.push(`http_request_duration_seconds{quantile="0.9"} ${((metrics.percentiles.p90 || 0) / 1000).toFixed(6)}`);
  lines.push(`http_request_duration_seconds{quantile="0.95"} ${((metrics.percentiles.p95 || 0) / 1000).toFixed(6)}`);
  lines.push(`http_request_duration_seconds{quantile="0.99"} ${((metrics.percentiles.p99 || 0) / 1000).toFixed(6)}`);
  lines.push(`http_request_duration_seconds_count ${metrics.totalRequests}`);
  lines.push(`http_request_duration_seconds_sum ${(store.totalDuration / 1000).toFixed(6)}`);

  // Methods
  lines.push('\n# HELP http_requests_by_method_total Total HTTP requests grouped by method');
  lines.push('# TYPE http_requests_by_method_total counter');
  for (const [method, count] of Object.entries(metrics.methods)) {
    lines.push(`http_requests_by_method_total{method="${method}"} ${count}`);
  }

  // Status codes
  lines.push('\n# HELP http_requests_by_status_total Total HTTP requests grouped by status code');
  lines.push('# TYPE http_requests_by_status_total counter');
  for (const [code, count] of Object.entries(metrics.statusCodes)) {
    lines.push(`http_requests_by_status_total{status="${code}"} ${count}`);
  }

  // Route metrics
  lines.push('\n# HELP express_lens_route_requests_total Requests per route');
  lines.push('# TYPE express_lens_route_requests_total counter');
  lines.push('# HELP express_lens_route_duration_milliseconds_avg Average latency per route in milliseconds');
  lines.push('# TYPE express_lens_route_duration_milliseconds_avg gauge');

  for (const [route, stats] of Object.entries(metrics.routes)) {
    const escapedRoute = route.replace(/"/g, '\\"');
    lines.push(`express_lens_route_requests_total{route="${escapedRoute}"} ${stats.count}`);
    lines.push(`express_lens_route_duration_milliseconds_avg{route="${escapedRoute}"} ${stats.avgDuration}`);
  }

  // System Memory & Uptime
  lines.push('\n# HELP express_lens_memory_rss_bytes Process RSS memory in bytes');
  lines.push('# TYPE express_lens_memory_rss_bytes gauge');
  lines.push(`express_lens_memory_rss_bytes ${metrics.system.memory.rss}`);

  lines.push('\n# HELP express_lens_memory_heap_used_bytes Process Heap Used memory in bytes');
  lines.push('# TYPE express_lens_memory_heap_used_bytes gauge');
  lines.push(`express_lens_memory_heap_used_bytes ${metrics.system.memory.heapUsed}`);

  lines.push('\n# HELP express_lens_uptime_seconds Process uptime in seconds');
  lines.push('# TYPE express_lens_uptime_seconds gauge');
  lines.push(`express_lens_uptime_seconds ${metrics.system.uptime.toFixed(2)}`);

  return lines.join('\n') + '\n';
}

/**
 * Express middleware route handler to serve Prometheus format metrics over HTTP.
 * @returns {Function} Express request handler (req, res)
 */
export function prometheusHandler() {
  return function (_req, res) {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    }
    const output = getPrometheusMetrics();
    if (typeof res.send === 'function') {
      res.send(output);
    } else if (typeof res.end === 'function') {
      res.end(output);
    }
  };
}
