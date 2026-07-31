import store from '../store.ts';
import { redactHeaders, generateCurl } from '../utils.ts';
import { getDashboardHTML } from '../dashboard.ts';
import type { ExpressLensOptions } from '../middleware.ts';

/**
 * Hono & Edge framework adapter for Express Lens HTTP monitoring and debugging.
 * Compatible with Hono, Cloudflare Workers, Deno, Bun, and Vercel Edge.
 */
export function honoExpressLens(options: ExpressLensOptions = {}): (c: any, next: () => Promise<void>) => Promise<any> {
  const slowThresholdMs = options.slowThresholdMs != null ? options.slowThresholdMs : 500;
  const customRedactList = Array.isArray(options.redactHeaders) ? options.redactHeaders : [];

  return async function middleware(c: any, next: () => Promise<void>): Promise<any> {
    const url = c.req.url || c.req.path || '/';

    // 1. Intercept /express-lens dashboard endpoints directly inside Hono
    if (url.includes('/express-lens')) {
      if (url.includes('/metrics-json')) {
        return c.json(store.getMetrics());
      }
      return c.html(getDashboardHTML());
    }

    const startTime = globalThis.performance ? globalThis.performance.now() : Date.now();

    store.totalRequests++;
    const method = c.req.method || 'GET';
    if (store.methods[method] !== undefined) {
      store.methods[method]++;
    } else {
      store.methods[method] = 1;
    }

    await next();

    const endTime = globalThis.performance ? globalThis.performance.now() : Date.now();
    const timeMs = endTime - startTime;
    const durationMs = Number(timeMs.toFixed(2));

    store.totalDuration += timeMs;
    store.recordLatency(timeMs);

    const status = c.res.status || 200;
    const requestId = `hono_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const headersObj: Record<string, string> = {};
    if (c.req.raw && c.req.raw.headers) {
      c.req.raw.headers.forEach((v: string, k: string) => {
        headersObj[k] = v;
      });
    }

    const sanitizedHeaders = redactHeaders(headersObj, customRedactList);

    const requestEntry = {
      id: requestId,
      timestamp: new Date().toISOString(),
      method,
      url,
      status,
      durationMs,
      headers: sanitizedHeaders,
      ip: c.req.header('x-forwarded-for') || '127.0.0.1',
      curl: generateCurl({ method, url, headers: sanitizedHeaders }),
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

    const routeKey = `${method} ${c.req.path || url}`;
    store.recordRoute(routeKey, timeMs);

    if (slowThresholdMs > 0 && timeMs >= slowThresholdMs) {
      store.recordSlowRequest({
        ...requestEntry,
        slowThresholdMs,
      });
    }

    store.checkAlerts(options);
  };
}

export default honoExpressLens;
