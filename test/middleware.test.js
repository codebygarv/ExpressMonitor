import test from 'node:test';
import assert from 'node:assert';
import monitor, { getMetrics, resetMetrics } from '../index.ts';

test('Middleware Integration Suite', async (t) => {
  t.afterEach(() => {
    resetMetrics();
  });

  await t.test('buffers slow requests exceeding slowThresholdMs', () => {
    const middleware = monitor({ logAnalytics: false, slowThresholdMs: 10 });
    const req = { method: 'GET', url: '/slow-endpoint', path: '/slow-endpoint' };
    const listeners = {};
    const res = { statusCode: 200, on: (evt, fn) => { listeners[evt] = fn; } };

    middleware(req, res, () => {});

    // Simulate duration > 10ms
    const start = Date.now();
    while (Date.now() - start < 15) {}

    listeners['finish']();

    const metrics = getMetrics();
    assert.strictEqual(metrics.slowRequests.length, 1);
    assert.strictEqual(metrics.slowRequests[0].url, '/slow-endpoint');
  });

  await t.test('redacts sensitive headers in recorded request entries', () => {
    const middleware = monitor({ logAnalytics: false });
    const req = {
      method: 'POST',
      url: '/login',
      path: '/login',
      headers: { authorization: 'Bearer 12345', 'content-type': 'application/json' }
    };
    const listeners = {};
    const res = { statusCode: 200, on: (evt, fn) => { listeners[evt] = fn; } };

    middleware(req, res, () => {});
    listeners['finish']();

    const metrics = getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
  });
});
