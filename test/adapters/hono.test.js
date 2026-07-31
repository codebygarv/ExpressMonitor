import test from 'node:test';
import assert from 'node:assert';
import { honoExpressLens } from '../../src/adapters/hono.ts';
import store from '../../src/store.ts';

test('Hono Adapter Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('tracks requests via Hono middleware', async () => {
    const middleware = honoExpressLens({ slowThresholdMs: 100 });
    const mockContext = {
      req: {
        method: 'POST',
        url: 'http://localhost/api/data',
        path: '/api/data',
        header: () => '127.0.0.1',
        raw: { headers: new Map([['content-type', 'application/json']]) }
      },
      res: { status: 201 }
    };

    await middleware(mockContext, async () => {});

    const metrics = store.getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
    assert.strictEqual(metrics.methods.POST, 1);
    assert.strictEqual(metrics.statusCodes[201], 1);
  });
});
