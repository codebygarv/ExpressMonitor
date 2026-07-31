import monitor, {
  getMetrics,
  resetMetrics,
  metricsHandler,
  prometheusHandler,
  dashboardHandler,
  exportHAR,
  replayRequest,
  generateCurl,
} from '../../index.ts';

export {
  monitor as expressLens,
  monitor,
  getMetrics,
  resetMetrics,
  metricsHandler,
  prometheusHandler,
  dashboardHandler,
  exportHAR,
  replayRequest,
  generateCurl,
};

export default monitor;
