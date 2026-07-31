import test from 'node:test';
import assert from 'node:assert';
import { withExpressLens, dashboardRoute } from '../../src/next.ts';
import store from '../../src/store.ts';

test('Next.js App Router Adapter Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('wraps Next.js route handler with withExpressLens', async () => {
    const mockHandler = async (req) => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    const wrapped = withExpressLens(mockHandler);
    const mockReq = new Request('http://localhost/api/users', {
      method: 'GET',
      headers: { 'user-agent': 'next-test' }
    });

    const res = await wrapped(mockReq);
    assert.strictEqual(res.status, 200);

    const metrics = store.getMetrics();
    assert.strictEqual(metrics.totalRequests, 1);
    assert.strictEqual(metrics.methods.GET, 1);
  });

  await t.test('dashboardRoute serves HTML dashboard in Next.js', async () => {
    const handler = dashboardRoute();
    const mockReq = new Request('http://localhost/api/express-lens');
    const res = await handler(mockReq);

    assert.strictEqual(res.headers.get('Content-Type'), 'text/html');
    const body = await res.text();
    assert.ok(body.includes('Express Lens'));
  });
});
