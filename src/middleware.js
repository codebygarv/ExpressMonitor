import store from './store.js';
import { getSystemMetrics } from './system.ts';
import { redactHeaders, generateCurl } from './utils.ts';

// ANSI color helpers
function colorizeStatus(status, colorize = true) {
  if (!colorize) return String(status);
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // Green
  return String(status);
}

function colorizeLatency(timeMs, colorize = true) {
  const formatted = `${timeMs.toFixed(2)}ms`;
  if (!colorize) return formatted;
  if (timeMs > 1000) return `\x1b[1;\x1b[31m${formatted}\x1b[0m`; // Bold Red
  if (timeMs > 500) return `\x1b[33m${formatted}\x1b[0m`;        // Yellow
  return `\x1b[32m${formatted}\x1b[0m`;                            // Green
}

function shouldIgnoreRoute(url, ignoreRoutes = []) {
  if (!ignoreRoutes || ignoreRoutes.length === 0) return false;
  return ignoreRoutes.some((pattern) => {
    if (typeof pattern === 'string') {
      return url === pattern || url.startsWith(pattern);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    return false;
  });
}

let requestIdCounter = 0;

export default function createMiddleware(options = {}) {
  const state = {
    lastLogTime: Date.now(),
    intervalReqCount: 0,
  };

  const slowThresholdMs = options.slowThresholdMs != null ? options.slowThresholdMs : 500;
  const customRedactList = Array.isArray(options.redactHeaders) ? options.redactHeaders : [];

  return function trackRequest(req, res, next) {
    const url = req.originalUrl || req.url || req.path || '';

    // Skip ignored routes
    if (shouldIgnoreRoute(url, options.ignoreRoutes)) {
      return next();
    }

    const startAt = process.hrtime();
    const requestId = `req_${Date.now()}_${++requestIdCounter}`;
    const timestamp = new Date().toISOString();
    const sanitizedHeaders = redactHeaders(req.headers || {}, customRedactList);

    // Track request count & method
    store.totalRequests++;
    if (store.methods[req.method] !== undefined) {
      store.methods[req.method]++;
    } else {
      store.methods[req.method] = 1;
    }

    // Hook into response finish event
    res.on('finish', () => {
      const diff = process.hrtime(startAt);
      const timeMs = (diff[0] * 1e3) + (diff[1] * 1e-6);

      store.totalDuration += timeMs;
      store.recordLatency(timeMs);

      const status = res.statusCode;
      const durationMs = Number(timeMs.toFixed(2));

      const requestEntry = {
        id: requestId,
        timestamp,
        method: req.method,
        url,
        status,
        durationMs,
        headers: sanitizedHeaders,
        ip: req.ip || req.socket?.remoteAddress || '127.0.0.1',
        curl: generateCurl({ method: req.method, url, headers: sanitizedHeaders, body: req.body }),
      };

      store.recordRequest(requestEntry);

      // Track errors
      if (status >= 400) {
        store.totalErrors++;
        store.recordError({
          id: requestId,
          timestamp,
          method: req.method,
          url,
          status,
          durationMs,
          headers: sanitizedHeaders,
        });
      }

      // Track status codes
      if (store.statusCodes[status] !== undefined) {
        store.statusCodes[status]++;
      } else {
        store.statusCodes[status] = 1;
      }

      // Record route performance metrics
      const routePath = req.route ? (req.baseUrl || '') + req.route.path : req.path;
      const routeKey = `${req.method} ${routePath}`;
      store.recordRoute(routeKey, timeMs);

      // Slow Request Profiler
      if (slowThresholdMs > 0 && timeMs >= slowThresholdMs) {
        store.recordSlowRequest({
          ...requestEntry,
          slowThresholdMs,
        });

        if (options.logAnalytics !== false) {
          console.warn(`[Analytics SLOW REQUEST] ${req.method} ${url} took ${timeMs.toFixed(2)}ms (Threshold: ${slowThresholdMs}ms)`);
        }
      }

      // Evaluate threshold alerts
      store.checkAlerts(options);

      // Logging if enabled
      if (options.logAnalytics !== false) {
        state.intervalReqCount++;
        const logInterval = options.logInterval || 0;
        const useColors = options.colorize !== false;

        if (logInterval === 0 || Date.now() - state.lastLogTime >= logInterval) {
          const { memory } = getSystemMetrics();
          const rssMb = (memory.rss / 1024 / 1024).toFixed(2);
          const avgDuration = store.totalRequests > 0 ? (store.totalDuration / store.totalRequests).toFixed(2) : '0.00';
          const coloredStatus = colorizeStatus(status, useColors);
          const coloredLatency = colorizeLatency(timeMs, useColors);

          if (logInterval === 0) {
            console.log(`[Analytics] ${req.method} ${url} -> ${coloredStatus} (${coloredLatency}) | Total Reqs: ${store.totalRequests} | Errors: ${store.totalErrors} | Avg: ${avgDuration}ms | Mem: ${rssMb}MB`);
          } else {
            console.log(`[Analytics Summary] Interval Reqs: ${state.intervalReqCount} | Total Reqs: ${store.totalRequests} | Errors: ${store.totalErrors} | Avg: ${avgDuration}ms | Mem: ${rssMb}MB`);
            state.intervalReqCount = 0;
            state.lastLogTime = Date.now();
          }
        }
      }
    });

    next();
  };
}
