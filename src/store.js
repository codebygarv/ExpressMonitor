import { getSystemMetrics } from './system.js';
import { calculatePercentile, redactHeaders } from './utils.js';

const MAX_ROUTES = 500;
const MAX_LATENCY_SAMPLES = 1000;
const MAX_RECENT_REQUESTS = 500;
const MAX_SLOW_REQUESTS = 50;

const store = {
  // Overall metrics
  totalRequests: 0,
  totalErrors: 0,
  totalDuration: 0,

  // Sliding window duration samples (capped at MAX_LATENCY_SAMPLES)
  latencies: [],

  // Status codes
  statusCodes: {
    200: 0,
    201: 0,
    400: 0,
    401: 0,
    404: 0,
    500: 0,
  },

  // Method metrics
  methods: {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0,
    PATCH: 0,
    OPTIONS: 0,
  },

  // Route metrics map (capped at MAX_ROUTES to prevent memory leaks)
  routes: new Map(),

  // Recent errors buffer (last 50 errors)
  recentErrors: [],

  // Recent requests ring buffer (last 500 requests for dashboard & HAR export)
  recentRequests: [],

  // Slow requests buffer (last 50 requests exceeding slowThresholdMs)
  slowRequests: [],

  // Active SSE subscribers for real-time dashboard updates
  sseClients: new Set(),

  recordLatency(timeMs) {
    this.latencies.push(timeMs);
    if (this.latencies.length > MAX_LATENCY_SAMPLES) {
      this.latencies.shift();
    }
  },

  recordRoute(routeKey, timeMs) {
    let key = routeKey;
    if (!this.routes.has(key) && this.routes.size >= MAX_ROUTES) {
      key = 'OTHER /other';
    }

    if (!this.routes.has(key)) {
      this.routes.set(key, {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        latencies: [],
      });
    }

    const routeStats = this.routes.get(key);
    routeStats.count++;
    routeStats.totalDuration += timeMs;
    routeStats.maxDuration = Math.max(routeStats.maxDuration, timeMs);
    routeStats.minDuration = Math.min(routeStats.minDuration, timeMs);

    routeStats.latencies.push(timeMs);
    if (routeStats.latencies.length > MAX_LATENCY_SAMPLES) {
      routeStats.latencies.shift();
    }
  },

  recordError(errorInfo) {
    this.recentErrors.push(errorInfo);
    if (this.recentErrors.length > 50) {
      this.recentErrors.shift();
    }
  },

  recordRequest(requestEntry) {
    this.recentRequests.push(requestEntry);
    if (this.recentRequests.length > MAX_RECENT_REQUESTS) {
      this.recentRequests.shift();
    }

    // Broadcast live event to connected SSE subscribers
    if (this.sseClients.size > 0) {
      const payload = `data: ${JSON.stringify(requestEntry)}\n\n`;
      for (const res of this.sseClients) {
        try {
          res.write(payload);
        } catch (_) {
          this.sseClients.delete(res);
        }
      }
    }
  },

  recordSlowRequest(slowEntry) {
    this.slowRequests.push(slowEntry);
    if (this.slowRequests.length > MAX_SLOW_REQUESTS) {
      this.slowRequests.shift();
    }
  },

  getPercentiles(samples = this.latencies) {
    return {
      p50: calculatePercentile(samples, 50),
      p90: calculatePercentile(samples, 90),
      p95: calculatePercentile(samples, 95),
      p99: calculatePercentile(samples, 99),
    };
  },

  checkAlerts(options = {}) {
    const alertsConfig = options.alerts || {};
    if (!alertsConfig.onAlert || typeof alertsConfig.onAlert !== 'function') {
      return;
    }

    const metrics = this.getMetrics();
    const now = new Date().toISOString();

    // 1. Error rate threshold alert
    if (alertsConfig.errorRateThreshold != null) {
      const numericErrorRate = parseFloat(metrics.errorRate);
      if (numericErrorRate >= alertsConfig.errorRateThreshold) {
        alertsConfig.onAlert({
          type: 'ERROR_RATE_EXCEEDED',
          message: `Error rate reached ${metrics.errorRate} (Threshold: ${alertsConfig.errorRateThreshold}%)`,
          metric: 'errorRate',
          value: numericErrorRate,
          threshold: alertsConfig.errorRateThreshold,
          timestamp: now,
        });
      }
    }

    // 2. RSS Memory threshold alert (MB)
    if (alertsConfig.memoryThresholdMb != null) {
      const rssMb = Number((metrics.system.memory.rss / (1024 * 1024)).toFixed(2));
      if (rssMb >= alertsConfig.memoryThresholdMb) {
        alertsConfig.onAlert({
          type: 'MEMORY_LIMIT_EXCEEDED',
          message: `Memory RSS reached ${rssMb} MB (Threshold: ${alertsConfig.memoryThresholdMb} MB)`,
          metric: 'rssMemoryMb',
          value: rssMb,
          threshold: alertsConfig.memoryThresholdMb,
          timestamp: now,
        });
      }
    }

    // 3. Average duration threshold alert (ms)
    if (alertsConfig.avgDurationThresholdMs != null) {
      if (metrics.avgDurationMs >= alertsConfig.avgDurationThresholdMs) {
        alertsConfig.onAlert({
          type: 'LATENCY_THRESHOLD_EXCEEDED',
          message: `Average latency reached ${metrics.avgDurationMs}ms (Threshold: ${alertsConfig.avgDurationThresholdMs}ms)`,
          metric: 'avgDurationMs',
          value: metrics.avgDurationMs,
          threshold: alertsConfig.avgDurationThresholdMs,
          timestamp: now,
        });
      }
    }
  },

  getMetrics() {
    const avgDuration = this.totalRequests > 0 ? Number((this.totalDuration / this.totalRequests).toFixed(2)) : 0;
    const errorRate = this.totalRequests > 0 ? Number(((this.totalErrors / this.totalRequests) * 100).toFixed(2)) : 0;

    const routesObject = {};
    for (const [key, stats] of this.routes.entries()) {
      routesObject[key] = {
        count: stats.count,
        avgDuration: stats.count > 0 ? Number((stats.totalDuration / stats.count).toFixed(2)) : 0,
        minDuration: stats.minDuration === Infinity ? 0 : Number(stats.minDuration.toFixed(2)),
        maxDuration: Number(stats.maxDuration.toFixed(2)),
        percentiles: this.getPercentiles(stats.latencies),
      };
    }

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: `${errorRate}%`,
      avgDurationMs: avgDuration,
      percentiles: this.getPercentiles(this.latencies),
      statusCodes: { ...this.statusCodes },
      methods: { ...this.methods },
      routes: routesObject,
      recentErrors: [...this.recentErrors],
      slowRequests: [...this.slowRequests],
      system: getSystemMetrics(),
    };
  },

  exportHAR(title = 'Express Lens HTTP Archive') {
    const entries = this.recentRequests.map((req) => {
      const startTime = new Date(req.timestamp || Date.now()).toISOString();
      const headers = Object.entries(redactHeaders(req.headers || {})).map(([k, v]) => ({
        name: k,
        value: String(v),
      }));

      return {
        startedDateTime: startTime,
        time: req.durationMs || 0,
        request: {
          method: req.method || 'GET',
          url: req.url || '/',
          httpVersion: 'HTTP/1.1',
          headers,
          queryString: [],
          cookies: [],
          headersSize: -1,
          bodySize: -1,
        },
        response: {
          status: req.status || 200,
          statusText: req.status >= 400 ? 'Error' : 'OK',
          httpVersion: 'HTTP/1.1',
          headers: [],
          cookies: [],
          content: {
            size: -1,
            mimeType: 'application/json',
          },
          redirectURL: '',
          headersSize: -1,
          bodySize: -1,
        },
        cache: {},
        timings: {
          send: 0,
          wait: req.durationMs || 0,
          receive: 0,
        },
      };
    });

    return {
      log: {
        version: '1.2',
        creator: {
          name: 'Express Lens',
          version: '2.2.0',
        },
        pages: [
          {
            startedDateTime: new Date().toISOString(),
            id: 'express_lens_log',
            title,
            pageTimings: {},
          },
        ],
        entries,
      },
    };
  },

  reset() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.totalDuration = 0;
    this.latencies = [];
    this.statusCodes = { 200: 0, 201: 0, 400: 0, 401: 0, 404: 0, 500: 0 };
    this.methods = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, OPTIONS: 0 };
    this.routes.clear();
    this.recentErrors = [];
    this.recentRequests = [];
    this.slowRequests = [];
  },
};

export default store;
