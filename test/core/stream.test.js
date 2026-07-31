import test from 'node:test';
import assert from 'node:assert';
import { createStreamCapturer } from '../../src/core/stream.ts';

test('Stream Capturer Suite', async (t) => {
  await t.test('captures small chunks within limit', () => {
    const capturer = createStreamCapturer(1024);
    capturer.onData('Hello ');
    capturer.onData('World!');

    const result = capturer.getResult();
    assert.strictEqual(result.body, 'Hello World!');
    assert.strictEqual(result.truncated, false);
    assert.strictEqual(result.sizeBytes, 12);
  });

  await t.test('truncates payload exceeding maxBodySize', () => {
    const capturer = createStreamCapturer(10);
    capturer.onData('1234567890EXTRA_DATA');

    const result = capturer.getResult();
    assert.strictEqual(result.body, '1234567890');
    assert.strictEqual(result.truncated, true);
    assert.strictEqual(result.sizeBytes, 20);
  });
});
