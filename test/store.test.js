import test from 'node:test';
import assert from 'node:assert';
import store from '../src/store.js';

test('Store Module Upgrades Suite', async (t) => {
  t.afterEach(() => {
    store.reset();
  });

  await t.test('calculates percentiles for recorded latencies', () => {
    for (let i = 1; i <= 100; i++) {
      store.recordLatency(i);
    }
    const percentiles = store.getPercentiles();
    assert.strictEqual(percentiles.p50, 50.5);
    assert.strictEqual(percentiles.p90, 90.1);
    assert.strictEqual(percentiles.p95, 95.05);
    assert.strictEqual(percentiles.p99, 99.01);
  });

  await t.test('triggers alert callback when thresholds are met', () => {
    let firedAlert = null;
    const options = {
      alerts: {
        errorRateThreshold: 10,
        onAlert: (alert) => { firedAlert = alert; }
      }
    };

    store.totalRequests = 10;
    store.totalErrors = 2; // 20% error rate
    store.checkAlerts(options);

    assert.ok(firedAlert !== null);
    assert.strictEqual(firedAlert.type, 'ERROR_RATE_EXCEEDED');
    assert.strictEqual(firedAlert.value, 20);
  });

  await t.test('exports valid HAR 1.2 object', () => {
    store.recordRequest({
      timestamp: new Date().toISOString(),
      method: 'GET',
      url: '/api/items',
      status: 200,
      durationMs: 45.5,
      headers: { 'user-agent': 'test' }
    });

    const har = store.exportHAR();
    assert.strictEqual(har.log.version, '1.2');
    assert.strictEqual(har.log.entries.length, 1);
    assert.strictEqual(har.log.entries[0].request.url, '/api/items');
    assert.strictEqual(har.log.entries[0].response.status, 200);
  });
});
