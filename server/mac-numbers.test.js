import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectNumbersResearchInput, inspectNumbersResearchResults, numbersStatus, parseNumbersTablePayload, parseNumbersVersion, parseResearchWriteReceipt, researchInputTableName, researchResultsHeaders, serializeResearchResults, summarizeNumbersTable, validateResearchInputTable, writeNumbersResearchResults } from './mac-numbers.js';

const separator = '\u001e';
const field = '\u001f';

test('reads the installed Numbers version without invoking AppleScript', () => {
  const status = numbersStatus({ platform: 'darwin', exists: path => path === '/Applications/Numbers.app', readFile: () => '<key>CFBundleShortVersionString</key><string>14.4</string>' });
  assert.equal(status.available, true);
  assert.equal(status.version, '14.4');
  assert.equal(parseNumbersVersion('<key>CFBundleShortVersionString</key> <string>15.0</string>'), '15.0');
});

test('parses a bounded Numbers table and produces transparent calculations', () => {
  const payload = ['ANUKRITI_NUMBERS_V1', 'Weekly numbers', 'Sales', 'Table 1', '3', '3', ['Region', 'Revenue', 'Orders'].join(field), ['North', '$1,250.50', '10'].join(field), ['South', '$749.50', '5'].join(field)].join(separator);
  const table = parseNumbersTablePayload(payload);
  const summary = summarizeNumbersTable(table);

  assert.equal(table.documentName, 'Weekly numbers');
  assert.equal(summary.dataRows, 2);
  assert.deepEqual(summary.numericColumns.map(column => [column.name, column.total, column.average]), [['Revenue', 2000, 1000], ['Orders', 15, 7.5]]);
});

test('normalizes missing values and trims the default unused Numbers grid', () => {
  const payload = ['ANUKRITI_NUMBERS_V1', 'Untitled', 'Sheet 1', 'Table 1', '4', '4', ['Region', 'Revenue', 'missing value', 'missing value'].join(field), ['North', '1250.5', 'missing value', 'missing value'].join(field), ['missing value', 'missing value', 'missing value', 'missing value'].join(field), ['missing value', 'missing value', 'missing value', 'missing value'].join(field)].join(separator);
  const table = parseNumbersTablePayload(payload);

  assert.equal(table.rowCount, 2);
  assert.equal(table.columnCount, 2);
  assert.deepEqual(table.rows, [['Region', 'Revenue'], ['North', '1250.5']]);
});

test('rejects malformed Numbers output instead of guessing data', () => {
  assert.throws(() => parseNumbersTablePayload(['ANUKRITI_NUMBERS_V1', 'doc', 'sheet', 'table', '2', '2', `A${field}B`].join(separator)), /incomplete table/);
});

test('validates the fixed Numbers research input contract', async () => {
  const payload = ['ANUKRITI_NUMBERS_V1', 'Research template', 'Research', researchInputTableName, '3', '2', ['Search term', 'Metric'].join(field), ['Flowood MS', 'Median home price'].join(field), ['AAPL', 'Momentum score'].join(field)].join(separator);
  const inspection = await inspectNumbersResearchInput(async () => ({ stdout: payload }));

  assert.equal(inspection.inputs.length, 2);
  assert.deepEqual(inspection.inputs[0], { id: 'input-1', searchTerm: 'Flowood MS', metric: 'Median home price' });
  const outputInspection = await inspectNumbersResearchResults(async () => ({ stdout: ['ANUKRITI_NUMBERS_V1', 'Research template', 'Research', 'Anukriti Research Results', '2', '6', researchResultsHeaders.join(field), ['Flowood MS', 'Median home price', '285000', 'https://example.com/flowood', '2026-07-19', 'Verified by user'].join(field)].join(separator) }));
  assert.equal(outputInspection.table.tableName, 'Anukriti Research Results');
  assert.throws(() => validateResearchInputTable({ rows: [['Search term'], ['Flowood']] }), /missing: Metric/);
});

test('serializes approved values as process data and confirms a fixed-table write receipt', async () => {
  const rows = [{ searchTerm: 'Flowood MS', metric: 'Median home price', value: 285000, sourceUrl: 'https://example.com/flowood', checkedAt: '2026-07-19T00:00:00.000Z', status: 'Verified by user' }];
  const packed = serializeResearchResults(rows);
  assert.match(packed, /Flowood MS/);
  assert.equal(packed.split(field).length, researchResultsHeaders.length);
  let received;
  const receipt = await writeNumbersResearchResults(rows, async (command, args) => {
    received = { command, args };
    return { stdout: ['ANUKRITI_NUMBERS_WRITE_V1', '1', 'Research template', 'Research', 'Anukriti Research Results'].join(separator) };
  });

  assert.equal(receipt.rows, 1);
  assert.equal(received.command, '/usr/bin/osascript');
  assert.equal(received.args.at(-1), packed);
  assert.doesNotMatch(received.args[1], /Flowood MS|example\.com/);
  assert.deepEqual(parseResearchWriteReceipt(['ANUKRITI_NUMBERS_WRITE_V1', '2', 'Doc', 'Sheet', 'Table'].join(separator)), { rows: 2, documentName: 'Doc', sheetName: 'Sheet', tableName: 'Table' });
});
