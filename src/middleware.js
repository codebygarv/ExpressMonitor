const store = require('./store');
const { getSystemMetrics } = require('./system');

function trackRequest(req, res, next, options = {}) {
  const startAt = process.hrtime();
  
  // Track basic request
  store.totalRequests++;
  if (store.methods[req.method] !== undefined) {
    store.methods[req.method]++;
  }

  // Hook into response finish
  res.on('finish', () => {
    const diff = process.hrtime(startAt);
    const timeMs = (diff[0] * 1e3) + (diff[1] * 1e-6);
    
    store.totalDuration += timeMs;

    // Track status code
    const status = res.statusCode;
    if (status >= 400) {
      store.totalErrors++;
    }
    
    // Add to specific status bucket if it exists, or dynamically if we want to track all
    if (store.statusCodes[status] !== undefined) {
      store.statusCodes[status]++;
    } else {
      store.statusCodes[status] = 1;
    }

    // Track route metrics
    const routePath = req.route ? (req.baseUrl || '') + req.route.path : req.path;
    const routeKey = `${req.method} ${routePath}`;
    
    if (!store.routes.has(routeKey)) {
      store.routes.set(routeKey, { count: 0, totalDuration: 0, maxDuration: 0, minDuration: Infinity });
    }
    
    const routeStats = store.routes.get(routeKey);
    routeStats.count++;
    routeStats.totalDuration += timeMs;
    routeStats.maxDuration = Math.max(routeStats.maxDuration, timeMs);
    routeStats.minDuration = Math.min(routeStats.minDuration, timeMs);

    if (options.logAnalytics !== false) {
      const { memory } = getSystemMetrics();
      const rssMb = (memory.rss / 1024 / 1024).toFixed(2);
      const avgDuration = store.totalRequests > 0 ? (store.totalDuration / store.totalRequests).toFixed(2) : '0.00';
      
      console.log(`[Analytics] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${timeMs.toFixed(2)}ms) | Total Reqs: ${store.totalRequests} | Errors: ${store.totalErrors} | Avg: ${avgDuration}ms | Mem: ${rssMb}MB`);
    }
  });

  next();
}

module.exports = trackRequest;
