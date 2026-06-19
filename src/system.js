const os = require('os');

function getSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  
  return {
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
}

module.exports = {
  getSystemMetrics
};
