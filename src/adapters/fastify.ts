import store from '../store.ts';
import { redactHeaders, generateCurl } from '../utils.ts';
import { getDashboardHTML } from '../dashboard.ts';
import type { ExpressLensOptions } from '../middleware.ts';

/**
 * Fastify plugin adapter for Express Lens HTTP monitoring and debugging.
 */
export function fastifyExpressLens(options: ExpressLensOptions = {}) {
  const slowThresholdMs = options.slowThresholdMs != null ? options.slowThresholdMs : 500;
  const customRedactList = Array.isArray(options.redactHeaders) ? options.redactHeaders : [];

  return async function expressLensPlugin(fastify: any) {
    const requestTimes = new WeakMap<any, number>();

    // 1. Hook into onRequest to record start time
    fastify.addHook('onRequest', (request: any, reply: any, done: () => void) => {
      requestTimes.set(request, Date.now());

      const url = request.raw?.url || request.url || '';
      store.totalRequests++;
      const method = request.method || 'GET';
      if (store.methods[method] !== undefined) {
        store.methods[method]++;
      } else {
        store.methods[method] = 1;
      }

      done();
    });

    // 2. Hook into onResponse to record metrics
    fastify.addHook('onResponse', (request: any, reply: any, done: () => void) => {
      const startTime = requestTimes.get(request) || Date.now();
      const timeMs = Date.now() - startTime;
      const durationMs = Number(timeMs.toFixed(2));

      store.totalDuration += timeMs;
      store.recordLatency(timeMs);

      const status = reply.statusCode || 200;
      const url = request.raw?.url || request.url || '';
      const method = request.method || 'GET';
      const requestId = `fastify_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const sanitizedHeaders = redactHeaders(request.headers || {}, customRedactList);

      const requestEntry = {
        id: requestId,
        timestamp: new Date().toISOString(),
        method,
        url,
        status,
        durationMs,
        headers: sanitizedHeaders,
        ip: request.ip || request.raw?.socket?.remoteAddress || '127.0.0.1',
        curl: generateCurl({ method, url, headers: sanitizedHeaders, body: request.body }),
      };

      store.recordRequest(requestEntry);

      if (status >= 400) {
        store.totalErrors++;
        store.recordError({
          id: requestId,
          timestamp: new Date().toISOString(),
          method,
          url,
          status,
          durationMs,
          headers: sanitizedHeaders,
        });
      }

      if (store.statusCodes[status] !== undefined) {
        store.statusCodes[status]++;
      } else {
        store.statusCodes[status] = 1;
      }

      const routeKey = `${method} ${request.routerPath || url}`;
      store.recordRoute(routeKey, timeMs);

      if (slowThresholdMs > 0 && timeMs >= slowThresholdMs) {
        store.recordSlowRequest({
          ...requestEntry,
          slowThresholdMs,
        });
      }

      store.checkAlerts(options);
      done();
    });

    // 3. Register Embedded Web Dashboard endpoint on Fastify
    fastify.get('/express-lens', async (request: any, reply: any) => {
      reply.type('text/html').send(getDashboardHTML());
    });

    fastify.get('/express-lens/metrics-json', async (request: any, reply: any) => {
      reply.type('application/json').send(store.getMetrics());
    });
  };
}

export default fastifyExpressLens;
