import { getSystemMetrics } from './system.js';

const MAX_ROUTES = 500;

const store = {
  // Overall metrics
  totalRequests: 0,
  totalErrors: 0,
  totalDuration: 0,

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

  recordRoute(routeKey, timeMs) {
    let key = routeKey;
    // Bound routes map size to prevent memory leak from dynamic URLs
    if (!this.routes.has(key) && this.routes.size >= MAX_ROUTES) {
      key = 'OTHER /other';
    }

    if (!this.routes.has(key)) {
      this.routes.set(key, { count: 0, totalDuration: 0, maxDuration: 0, minDuration: Infinity });
    }

    const routeStats = this.routes.get(key);
    routeStats.count++;
    routeStats.totalDuration += timeMs;
    routeStats.maxDuration = Math.max(routeStats.maxDuration, timeMs);
    routeStats.minDuration = Math.min(routeStats.minDuration, timeMs);
  },

  recordError(errorInfo) {
    this.recentErrors.push(errorInfo);
    if (this.recentErrors.length > 50) {
      this.recentErrors.shift();
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
      };
    }

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: `${errorRate}%`,
      avgDurationMs: avgDuration,
      statusCodes: { ...this.statusCodes },
      methods: { ...this.methods },
      routes: routesObject,
      recentErrors: [...this.recentErrors],
      system: getSystemMetrics(),
    };
  },

  reset() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.totalDuration = 0;
    this.statusCodes = { 200: 0, 201: 0, 400: 0, 401: 0, 404: 0, 500: 0 };
    this.methods = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, OPTIONS: 0 };
    this.routes.clear();
    this.recentErrors = [];
  }
};

export default store;
