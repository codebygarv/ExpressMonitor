import os from 'os';

export interface SystemMetrics {
  uptime: number;
  memory: {
    heapTotal: number;
    heapUsed: number;
    rss: number;
    external: number;
  };
  system: {
    totalMem: number;
    freeMem: number;
    cpus: number;
    loadavg: number[];
  };
}

let cachedMetrics: SystemMetrics | null = null;
let lastMetricFetchTime = 0;

/**
 * Retrieves process and system metrics with a configurable cache TTL.
 * @param cacheTTL Cache duration in milliseconds (default: 5000ms)
 */
export function getSystemMetrics(cacheTTL: number = 5000): SystemMetrics {
  const now = Date.now();
  if (cachedMetrics && now - lastMetricFetchTime < cacheTTL) {
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
    },
  };

  lastMetricFetchTime = now;
  return cachedMetrics;
}
