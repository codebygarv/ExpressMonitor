const os = require('os');

let cachedMetrics = null;
let lastMetricFetchTime = 0;

function getSystemMetrics(cacheTTL = 5000) {
  const now = Date.now();
  if (cachedMetrics && (now - lastMetricFetchTime < cacheTTL)) {
    return cachedMetrics;
  }

  const memoryUsage = process.memoryUsage();
  
  cachedMetrics = {
    uptime: process.uptime(),
    memory: {
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      rss: memoryUsage.rss,
      external: memoryUsage.external,
    },
    system: {
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus().length,
      loadavg: os.loadavg(), // [1, 5, 15] minute load averages
    }
  };
  
  lastMetricFetchTime = now;
  return cachedMetrics;
}

module.exports = {
  getSystemMetrics
};
