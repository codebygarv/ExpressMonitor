import store from './store.ts';
import { redactHeaders, generateCurl } from './utils.ts';
import { getDashboardHTML } from './dashboard.ts';
import type { ExpressLensOptions } from './middleware.ts';

/**
 * Higher-Order Function to wrap Next.js App Router route handlers with HTTP monitoring.
 */
export function withExpressLens(handler: Function, options: ExpressLensOptions = {}): (req: Request, context?: any) => Promise<Response> {
  const slowThresholdMs = options.slowThresholdMs != null ? options.slowThresholdMs : 500;
  const customRedactList = Array.isArray(options.redactHeaders) ? options.redactHeaders : [];

  return async function expressLensNextHandler(req: Request, context?: any): Promise<Response> {
    const startTime = globalThis.performance ? globalThis.performance.now() : Date.now();
    const url = req.url || '/';
    const method = req.method || 'GET';

    store.totalRequests++;
    if (store.methods[method] !== undefined) {
      store.methods[method]++;
    } else {
      store.methods[method] = 1;
    }

    let response: Response;
    try {
      response = await handler(req, context);
    } catch (error) {
      store.totalErrors++;
      throw error;
    } finally {
      const endTime = globalThis.performance ? globalThis.performance.now() : Date.now();
      const timeMs = endTime - startTime;
      const durationMs = Number(timeMs.toFixed(2));

      store.totalDuration += timeMs;
      store.recordLatency(timeMs);

      const status = response! ? response.status : 500;
      const requestId = `next_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const headersObj: Record<string, string> = {};
      if (req.headers) {
        req.headers.forEach((v, k) => {
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
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
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

      const routeKey = `${method} ${url}`;
      store.recordRoute(routeKey, timeMs);

      if (slowThresholdMs > 0 && timeMs >= slowThresholdMs) {
        store.recordSlowRequest({
          ...requestEntry,
          slowThresholdMs,
        });
      }

      store.checkAlerts(options);
    }

    return response;
  };
}

/**
 * Route handler for exposing the Express Lens dashboard in Next.js catch-all route.
 * Usage: export const GET = dashboardRoute(); inside app/api/express-lens/[[...route]]/route.ts
 */
export function dashboardRoute(): (req: Request) => Promise<Response> {
  return async function handleNextDashboard(req: Request): Promise<Response> {
    const url = req.url || '';
    if (url.includes('/metrics-json')) {
      return Response.json(store.getMetrics());
    }
    return new Response(getDashboardHTML(), {
      headers: { 'Content-Type': 'text/html' },
    });
  };
}
