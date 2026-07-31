import test from 'node:test';
import assert from 'node:assert';
import { getPrometheusMetrics, prometheusHandler } from '../src/prometheus.js';
import store from '../src/store.ts';

test('Prometheus Exporter Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('generates valid Prometheus text format', () => {
    store.totalRequests = 5;
    store.totalErrors = 1;
    store.totalDuration = 250;
    store.recordLatency(50);
    store.recordRoute('GET /api/users', 50);

    const output = getPrometheusMetrics();
    assert.ok(output.includes('# HELP http_requests_total'));
    assert.ok(output.includes('http_requests_total 5'));
    assert.ok(output.includes('http_request_errors_total 1'));
    assert.ok(output.includes('http_request_duration_seconds{quantile="0.5"}'));
    assert.ok(output.includes('express_lens_route_requests_total{route="GET /api/users"} 1'));
    assert.ok(output.includes('express_lens_memory_rss_bytes'));
  });

  await t.test('prometheusHandler serves plain text response', () => {
    store.totalRequests = 2;
    let contentType = '';
    let sentBody = '';

    const mockRes = {
      setHeader: (k, v) => { if (k.toLowerCase() === 'content-type') contentType = v; },
      send: (body) => { sentBody = body; }
    };

    const handler = prometheusHandler();
    handler({}, mockRes);

    assert.ok(contentType.includes('text/plain'));
    assert.ok(sentBody.includes('http_requests_total 2'));
  });
});
