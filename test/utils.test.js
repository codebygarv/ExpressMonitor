import test from 'node:test';
import assert from 'node:assert';
import { calculatePercentile, redactHeaders, generateCurl } from '../src/utils.ts';

test('Utils Module Suite', async (t) => {
  await t.test('calculatePercentile computes p50, p90, p95, p99 correctly', () => {
    const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    assert.strictEqual(calculatePercentile(latencies, 50), 55);
    assert.strictEqual(calculatePercentile(latencies, 90), 91);
    assert.strictEqual(calculatePercentile(latencies, 95), 95.5);
    assert.strictEqual(calculatePercentile(latencies, 99), 99.1);
  });

  await t.test('redactHeaders masks sensitive headers', () => {
    const headers = {
      'authorization': 'Bearer secret-token-123',
      'content-type': 'application/json',
      'cookie': 'session=abc',
      'x-custom-secret': 'my-secret',
    };
    const sanitized = redactHeaders(headers, ['x-custom-secret']);
    assert.strictEqual(sanitized['authorization'], '[REDACTED]');
    assert.strictEqual(sanitized['cookie'], '[REDACTED]');
    assert.strictEqual(sanitized['content-type'], 'application/json');
    assert.strictEqual(sanitized['x-custom-secret'], '[REDACTED]');
  });

  await t.test('generateCurl creates valid cURL command', () => {
    const req = {
      method: 'POST',
      url: 'https://api.example.com/login',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer token' },
      body: { username: 'test' },
    };
    const curl = generateCurl(req);
    assert.ok(curl.includes('curl -X POST "https://api.example.com/login"'));
    assert.ok(curl.includes('-H "authorization: [REDACTED]"'));
    assert.ok(curl.includes('--data "{\\"username\\":\\"test\\"}"'));
  });
});
