import test from 'node:test';
import assert from 'node:assert';
import { dashboardHandler, getDashboardHTML } from '../src/dashboard.ts';
import store from '../src/store.ts';

test('Dashboard Module Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('getDashboardHTML renders valid HTML dashboard', () => {
    const html = getDashboardHTML();
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('Express Lens'));
    assert.ok(html.includes('Export HAR 1.2'));
    assert.ok(html.includes('EventSource'));
  });

  await t.test('dashboardHandler serves HTML UI for main endpoint', () => {
    let contentType = '';
    let sentBody = '';

    const mockRes = {
      setHeader: (k, v) => { if (k.toLowerCase() === 'content-type') contentType = v; },
      send: (body) => { sentBody = body; }
    };

    const handler = dashboardHandler();
    handler({ url: '/express-lens' }, mockRes, () => {});

    assert.strictEqual(contentType, 'text/html');
    assert.ok(sentBody.includes('Express Lens'));
  });

  await t.test('dashboardHandler serves metrics-json endpoint', () => {
    store.totalRequests = 10;
    let contentType = '';
    let sentBody = '';

    const mockRes = {
      setHeader: (k, v) => { if (k.toLowerCase() === 'content-type') contentType = v; },
      send: (body) => { sentBody = body; }
    };

    const handler = dashboardHandler();
    handler({ url: '/express-lens/metrics-json' }, mockRes, () => {});

    assert.strictEqual(contentType, 'application/json');
    assert.ok(sentBody.includes('"totalRequests":10'));
  });
});
