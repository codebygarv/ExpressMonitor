import test from 'node:test';
import assert from 'node:assert';
import { formatPayload } from '../../src/core/formatter.ts';

test('Payload Formatter Suite', async (t) => {
  await t.test('collapses objects exceeding maxDepth', () => {
    const deepObj = { level1: { level2: { level3: { level4: { level5: 'hidden' } } } } };
    const formatted = formatPayload(deepObj, { maxDepth: 3 });

    assert.deepStrictEqual(formatted, {
      level1: { level2: { level3: '[Object]' } }
    });
  });

  await t.test('truncates array items exceeding maxArrayItems', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const formatted = formatPayload(arr, { maxArrayItems: 5 });

    assert.strictEqual(formatted.length, 6);
    assert.strictEqual(formatted[5], '... 7 more items');
  });
});
