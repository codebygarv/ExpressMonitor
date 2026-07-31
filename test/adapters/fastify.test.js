import test from 'node:test';
import assert from 'node:assert';
import { fastifyExpressLens } from '../../src/adapters/fastify.ts';
import store from '../../src/store.ts';

test('Fastify Adapter Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('tracks requests via Fastify hooks', async () => {
    const plugin = fastifyExpressLens({ slowThresholdMs: 100 });
    const hooks = {};
    const routes = {};

    const mockFastify = {
      addHook: (event, fn) => {
        hooks[event] = fn;
      },
      get: (path, fn) => {
        routes[path] = fn;
      }
    };

    await plugin(mockFastify);

    assert.ok(typeof hooks['onRequest'] === 'function');
    assert.ok(typeof hooks['onResponse'] === 'function');

    const req = { method: 'GET', url: '/fastify-test', headers: {} };
    const res = { statusCode: 200 };

    hooks['onRequest'](req, res, () => {});
    hooks['onResponse'](req, res, () => {});

    const metrics = store.getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
    assert.strictEqual(metrics.methods.GET, 1);
    assert.strictEqual(metrics.statusCodes[200], 1);
  });
});
