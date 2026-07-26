import test from 'node:test';
import assert from 'node:assert';
import monitor, { getMetrics, resetMetrics, metricsHandler } from '../index.js';

test('ExpressLens Middleware Suite', async (t) => {
  t.afterEach(() => {
    resetMetrics();
  });

  await t.test('tracks incoming HTTP requests and status codes', () => {
    const middleware = monitor({ logAnalytics: false });
    const req = { method: 'GET', url: '/api/users', path: '/api/users' };
    const listeners = {};
    const res = {
      statusCode: 200,
      on: (evt, fn) => { listeners[evt] = fn; }
    };

    middleware(req, res, () => {});
    listeners['finish']();

    const metrics = getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
    assert.strictEqual(metrics.methods.GET, 1);
    assert.strictEqual(metrics.statusCodes[200], 1);
    assert.strictEqual(metrics.totalErrors, 0);
  });

  await t.test('buffers error responses (HTTP status >= 400)', () => {
    const middleware = monitor({ logAnalytics: false });
    const req = { method: 'POST', url: '/api/login', path: '/api/login' };
    const listeners = {};
    const res = {
      statusCode: 401,
      on: (evt, fn) => { listeners[evt] = fn; }
    };

    middleware(req, res, () => {});
    listeners['finish']();

    const metrics = getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
    assert.strictEqual(metrics.totalErrors, 1);
    assert.strictEqual(metrics.statusCodes[401], 1);
    assert.strictEqual(metrics.recentErrors.length, 1);
    assert.strictEqual(metrics.recentErrors[0].status, 401);
    assert.strictEqual(metrics.recentErrors[0].url, '/api/login');
  });

  await t.test('skips routes specified in ignoreRoutes option', () => {
    const middleware = monitor({
      logAnalytics: false,
      ignoreRoutes: ['/health', '/favicon.ico']
    });

    const req = { method: 'GET', url: '/health', path: '/health' };
    let nextCalled = false;
    middleware(req, {}, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    const metrics = getMetrics();
    assert.strictEqual(metrics.totalRequests, 0);
  });

  await t.test('prevents memory leak by capping routes map capacity', () => {
    const middleware = monitor({ logAnalytics: false });

    // Simulate 550 unique dynamic routes
    for (let i = 0; i < 550; i++) {
      const listeners = {};
      const req = { method: 'GET', url: `/dynamic/${i}`, path: `/dynamic/${i}` };
      const res = { statusCode: 200, on: (evt, fn) => { listeners[evt] = fn; } };
      middleware(req, res, () => {});
      listeners['finish']();
    }

    const metrics = getMetrics();
    const routeKeys = Object.keys(metrics.routes);
    // Should cap dynamic entries and aggregate remainder in 'OTHER /other'
    assert.ok(routeKeys.length <= 501);
    assert.ok('OTHER /other' in metrics.routes);
  });

  await t.test('metricsHandler serves JSON response', () => {
    const middleware = monitor({ logAnalytics: false });
    const req = { method: 'GET', url: '/test', path: '/test' };
    const listeners = {};
    const res = { statusCode: 200, on: (evt, fn) => { listeners[evt] = fn; } };
    middleware(req, res, () => {});
    listeners['finish']();

    let outputJson = null;
    const handler = metricsHandler();
    const mockRes = {
      setHeader: () => {},
      send: (body) => { outputJson = JSON.parse(body); },
      json: (data) => { outputJson = data; }
    };

    handler({}, mockRes);
    assert.ok(outputJson !== null);
    assert.strictEqual(outputJson.totalRequests, 1);
  });
});
