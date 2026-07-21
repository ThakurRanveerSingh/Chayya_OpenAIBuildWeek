import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validate, writeWorkbook } from './posable.js';

const originalCwd = process.cwd();
const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'anukriti-posable-'));
process.chdir(testDirectory);

test.after(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDirectory, { recursive: true, force: true });
});

test('flags configured outliers and missing dates while excluding corrected rows', () => {
  const rows = [
    { id: 'TX-1', date: '', customer: 'Ada', amount: 700 },
    { id: 'TX-2', date: '2026-07-01', customer: 'Sam', amount: 90 }
  ];
  const result = validate(rows, { threshold: 500, requireDate: true, excludedIds: ['TX-2'] });

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].flags, ['Over $500', 'Missing date']);
});

test('writes a downloadable Excel review workbook', async () => {
  const output = await writeWorkbook([{ id: 'TX-1', date: '2026-07-01', customer: 'Ada', amount: 123.45, flags: [] }]);
  const target = path.resolve(output.slice(1));

  assert.match(output, /^\/output\/anukriti-\d+\.xlsx$/);
  assert.ok(fs.existsSync(target));
  assert.ok(fs.statSync(target).size > 0);
});
