const test = require('node:test');
const assert = require('node:assert/strict');
const { bingSearchUrl } = require('./security.cjs');

test('creates an encoded Bing URL from a bounded plain-text query', () => {
  assert.equal(bingSearchUrl('Flowood MS house prices'), 'https://www.bing.com/search?q=Flowood%20MS%20house%20prices');
  assert.throws(() => bingSearchUrl(''), /short, plain-text/);
  assert.throws(() => bingSearchUrl(`valid\nquery`), /short, plain-text/);
});
