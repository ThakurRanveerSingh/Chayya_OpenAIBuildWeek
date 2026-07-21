import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const numbersApp = '/Applications/Numbers.app';
const infoPlist = `${numbersApp}/Contents/Info.plist`;
const recordSeparator = '\u001e';
const fieldSeparator = '\u001f';
export const researchInputTableName = 'Anukriti Research Input';
export const researchResultsTableName = 'Anukriti Research Results';
export const researchInputHeaders = ['Search term', 'Metric'];
export const researchResultsHeaders = ['Search term', 'Metric', 'Value', 'Source URL', 'Checked at', 'Status'];

// This script is deliberately fixed: no filename, formula, or user text is
// interpolated into it. The adapter only reads the first table on the active
// sheet and caps the result so a large spreadsheet cannot exhaust the API.
const readActiveTableScript = `
on replaceText(findText, replacementText, sourceText)
  set AppleScript's text item delimiters to findText
  set textItems to every text item of sourceText
  set AppleScript's text item delimiters to replacementText
  set sourceText to textItems as text
  set AppleScript's text item delimiters to ""
  return sourceText
end replaceText

on cleanValue(rawValue)
  try
    set valueText to rawValue as text
  on error
    set valueText to ""
  end try
  if valueText is "missing value" then return ""
  set valueText to my replaceText(ASCII character 30, " ", valueText)
  set valueText to my replaceText(ASCII character 31, " ", valueText)
  set valueText to my replaceText(return, " ", valueText)
  return valueText
end cleanValue

on joinValues(valueList, separatorText)
  set AppleScript's text item delimiters to separatorText
  set joinedValues to valueList as text
  set AppleScript's text item delimiters to ""
  return joinedValues
end joinValues

tell application "Numbers"
  if not (exists front document) then error "Open a Numbers spreadsheet, select its sheet, and try again."
  set sourceDocument to front document
  set sourceSheet to active sheet of sourceDocument
  if (count of tables of sourceSheet) is 0 then error "The active Numbers sheet has no table to inspect."
  set sourceTable to table 1 of sourceSheet
  set rowLimit to 200
  set columnLimit to 30
  set numberOfRows to row count of sourceTable
  set numberOfColumns to column count of sourceTable
  if numberOfRows is greater than rowLimit then set numberOfRows to rowLimit
  if numberOfColumns is greater than columnLimit then set numberOfColumns to columnLimit
  set outputRows to {"ANUKRITI_NUMBERS_V1", my cleanValue(name of sourceDocument), my cleanValue(name of sourceSheet), my cleanValue(name of sourceTable), numberOfRows as text, numberOfColumns as text}
  repeat with rowNumber from 1 to numberOfRows
    set outputCells to {}
    repeat with columnNumber from 1 to numberOfColumns
      set end of outputCells to my cleanValue(formatted value of cell columnNumber of row rowNumber of sourceTable)
    end repeat
    set end of outputRows to my joinValues(outputCells, ASCII character 31)
  end repeat
  return my joinValues(outputRows, ASCII character 30)
end tell`;

// The research workflow reads a named table rather than whichever table happens
// to be first. The table name is a fixed application contract, never user input.
const readNamedResearchTableScript = (tableName, message) => readActiveTableScript.replace('set sourceTable to table 1 of sourceSheet', `if not (exists table "${tableName}" of sourceSheet) then error "${message}"
  set sourceTable to table "${tableName}" of sourceSheet`);
const readResearchInputScript = readNamedResearchTableScript(researchInputTableName, `The active sheet needs a table named ${researchInputTableName}.`);
const readResearchResultsScript = readNamedResearchTableScript(researchResultsTableName, `The active sheet needs a table named ${researchResultsTableName}.`);

// Input values are passed as a process argument, not interpolated into this
// AppleScript. The output table is fixed, so this bridge cannot target arbitrary
// documents, sheets, tables, formulas, or charts.
const writeResearchResultsScript = `
on splitText(sourceText, delimiterText)
  set AppleScript's text item delimiters to delimiterText
  set textItems to every text item of sourceText
  set AppleScript's text item delimiters to ""
  return textItems
end splitText

on cleanValue(rawValue)
  try
    set valueText to rawValue as text
  on error
    set valueText to ""
  end try
  if valueText is "missing value" then return ""
  return valueText
end cleanValue

on run argv
  if (count of argv) is not 1 then error "Anukriti received an invalid Numbers write request."
  set packedRows to my splitText(item 1 of argv, ASCII character 30)
  if (count of packedRows) is 0 then error "There are no approved research rows to write."
  tell application "Numbers"
    if not (exists front document) then error "Open the approved Numbers template and try again."
    set targetDocument to front document
    set targetSheet to active sheet of targetDocument
    if not (exists table "${researchResultsTableName}" of targetSheet) then error "The active sheet needs a table named ${researchResultsTableName}."
    set targetTable to table "${researchResultsTableName}" of targetSheet
    set expectedHeaders to {"Search term", "Metric", "Value", "Source URL", "Checked at", "Status"}
    if (column count of targetTable) is less than (count of expectedHeaders) then error "The result table needs six output columns."
    repeat with columnNumber from 1 to (count of expectedHeaders)
      if my cleanValue(formatted value of cell columnNumber of row 1 of targetTable) is not (item columnNumber of expectedHeaders) then error "The result table headers do not match the approved Anukriti template."
    end repeat
    if (row count of targetTable) is less than ((count of packedRows) + 1) then error "The result table does not have enough prepared rows. Add blank rows to the approved template and try again."
    repeat with rowNumber from 2 to (row count of targetTable)
      repeat with columnNumber from 1 to (count of expectedHeaders)
        set value of cell columnNumber of row rowNumber of targetTable to ""
      end repeat
    end repeat
    repeat with resultIndex from 1 to (count of packedRows)
      set resultValues to my splitText(item resultIndex of packedRows, ASCII character 31)
      if (count of resultValues) is not (count of expectedHeaders) then error "Anukriti received an incomplete approved research row."
      set targetRow to resultIndex + 1
      repeat with columnNumber from 1 to (count of expectedHeaders)
        set value of cell columnNumber of row targetRow of targetTable to (item columnNumber of resultValues)
      end repeat
    end repeat
    save targetDocument
    return "ANUKRITI_NUMBERS_WRITE_V1" & ASCII character 30 & (count of packedRows as text) & ASCII character 30 & (name of targetDocument) & ASCII character 30 & (name of targetSheet) & ASCII character 30 & (name of targetTable)
  end tell
end run`;

export function parseNumbersVersion(plistText = '') {
  return plistText.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/)?.[1] || null;
}

export function numbersStatus({ platform = process.platform, exists = fs.existsSync, readFile = fs.readFileSync } = {}) {
  const installed = platform === 'darwin' && exists(numbersApp);
  let version = null;
  if (installed) {
    try { version = parseNumbersVersion(readFile(infoPlist, 'utf8')); } catch { /* The application can still be detected without a readable plist. */ }
  }
  return {
    platform,
    available: installed,
    version,
    mode: installed ? 'read-only active-table inspection' : 'unavailable',
    safeguards: ['Reads only the active Numbers table.', 'Never overwrites the open spreadsheet.', 'Caps each inspection at 200 rows and 30 columns.', 'Requires an explicit user action and macOS Automation permission.']
  };
}

export function parseNumbersTablePayload(payload) {
  const values = String(payload || '').trim().split(recordSeparator);
  if (values.shift() !== 'ANUKRITI_NUMBERS_V1') throw new Error('Numbers returned an unreadable table payload.');
  const [documentName = '', sheetName = '', tableName = '', rowCount = '0', columnCount = '0', ...lines] = values;
  const rows = lines.filter(Boolean).map(line => line.split(fieldSeparator).map(value => value === 'missing value' ? '' : value));
  const expectedRows = Number(rowCount); const expectedColumns = Number(columnCount);
  if (!Number.isInteger(expectedRows) || !Number.isInteger(expectedColumns) || rows.length !== expectedRows || rows.some(row => row.length !== expectedColumns)) {
    throw new Error('Numbers returned an incomplete table. Select a normal table and try again.');
  }
  let lastRow = -1; let lastColumn = -1;
  rows.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    if (String(value).trim()) { lastRow = Math.max(lastRow, rowIndex); lastColumn = Math.max(lastColumn, columnIndex); }
  }));
  const usedRows = lastRow < 0 ? [] : rows.slice(0, lastRow + 1).map(row => row.slice(0, lastColumn + 1));
  return { documentName, sheetName, tableName, rowCount: usedRows.length, columnCount: lastColumn + 1, rows: usedRows };
}

function numericValue(value) {
  const normalized = String(value || '').replace(/[$,%\s,]/g, '').replace(/^\((.*)\)$/, '-$1');
  if (!normalized || !/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  return Number(normalized);
}

export function summarizeNumbersTable(table) {
  const [headerRow = [], ...dataRows] = table.rows;
  const numericColumns = headerRow.map((header, index) => {
    const values = dataRows.map(row => numericValue(row[index])).filter(value => value !== null && Number.isFinite(value));
    if (!values.length) return null;
    const total = values.reduce((sum, value) => sum + value, 0);
    return { name: header || `Column ${index + 1}`, values: values.length, total: Number(total.toFixed(2)), average: Number((total / values.length).toFixed(2)), minimum: Math.min(...values), maximum: Math.max(...values) };
  }).filter(Boolean);
  return { dataRows: Math.max(dataRows.length, 0), columns: table.columnCount, numericColumns };
}

export async function inspectActiveNumbersTable(run = runFile) {
  if (process.platform !== 'darwin') throw new Error('Numbers inspection is available only on macOS.');
  if (!fs.existsSync(numbersApp)) throw new Error('Apple Numbers is not installed in /Applications.');
  try {
    const { stdout } = await run('/usr/bin/osascript', ['-e', readActiveTableScript], { timeout: 15_000, maxBuffer: 512 * 1024, windowsHide: true });
    const table = parseNumbersTablePayload(stdout);
    return { table, summary: summarizeNumbersTable(table), inspectedAt: new Date().toISOString() };
  } catch (error) {
    const message = error.stderr?.trim() || error.message || 'Numbers inspection failed.';
    if (/not authorized|not permitted|automation/i.test(message)) throw new Error('macOS blocked the Numbers connection. Allow Anukriti or your terminal under System Settings → Privacy & Security → Automation, then try again.');
    throw new Error(message.replace(/^\d+:\d+: execution error: /, ''));
  }
}

export function validateResearchInputTable(table) {
  const [headers = [], ...rows] = table.rows || [];
  const normalizedHeaders = headers.map(value => String(value || '').trim().toLowerCase());
  const missing = researchInputHeaders.filter(header => !normalizedHeaders.includes(header.toLowerCase()));
  if (missing.length) throw new Error(`The ${researchInputTableName} table is missing: ${missing.join(', ')}.`);
  const searchTermIndex = normalizedHeaders.indexOf('search term');
  const metricIndex = normalizedHeaders.indexOf('metric');
  const inputs = rows.map((row, index) => ({
    id: `input-${index + 1}`,
    searchTerm: String(row[searchTermIndex] || '').trim(),
    metric: String(row[metricIndex] || '').trim()
  })).filter(item => item.searchTerm || item.metric);
  if (!inputs.length) throw new Error(`Add at least one row to ${researchInputTableName}.`);
  if (inputs.length > 25) throw new Error('Use no more than 25 research rows in one Numbers run.');
  if (inputs.some(item => !item.searchTerm || !item.metric)) throw new Error('Every research row needs both a Search term and a Metric.');
  const duplicates = new Set();
  for (const item of inputs) {
    const key = `${item.searchTerm.toLowerCase()}|${item.metric.toLowerCase()}`;
    if (duplicates.has(key)) throw new Error('Remove duplicate Search term and Metric rows before capturing this run.');
    duplicates.add(key);
  }
  return inputs;
}

export async function inspectNumbersResearchInput(run = runFile) {
  if (process.platform !== 'darwin') throw new Error('Numbers research is available only on macOS.');
  if (!fs.existsSync(numbersApp)) throw new Error('Apple Numbers is not installed in /Applications.');
  try {
    const { stdout } = await run('/usr/bin/osascript', ['-e', readResearchInputScript], { timeout: 15_000, maxBuffer: 512 * 1024, windowsHide: true });
    const table = parseNumbersTablePayload(stdout);
    return { table, inputs: validateResearchInputTable(table), inspectedAt: new Date().toISOString() };
  } catch (error) {
    const message = error.stderr?.trim() || error.message || 'Numbers research input could not be read.';
    if (/not authorized|not permitted|automation/i.test(message)) throw new Error('macOS blocked the Numbers connection. Allow Anukriti or your desktop app under System Settings → Privacy & Security → Automation, then try again.');
    throw new Error(message.replace(/^\d+:\d+: execution error: /, ''));
  }
}

export async function inspectNumbersResearchResults(run = runFile) {
  if (process.platform !== 'darwin') throw new Error('Numbers research is available only on macOS.');
  if (!fs.existsSync(numbersApp)) throw new Error('Apple Numbers is not installed in /Applications.');
  try {
    const { stdout } = await run('/usr/bin/osascript', ['-e', readResearchResultsScript], { timeout: 15_000, maxBuffer: 512 * 1024, windowsHide: true });
    return { table: parseNumbersTablePayload(stdout), inspectedAt: new Date().toISOString() };
  } catch (error) {
    const message = error.stderr?.trim() || error.message || 'Numbers research results could not be read.';
    if (/not authorized|not permitted|automation/i.test(message)) throw new Error('macOS blocked the Numbers connection. Allow Anukriti or your desktop app under System Settings → Privacy & Security → Automation, then try again.');
    throw new Error(message.replace(/^\d+:\d+: execution error: /, ''));
  }
}

function packedResearchValue(value) {
  return String(value ?? '').replace(/[\u001e\u001f\r\n]/g, ' ').trim();
}

export function serializeResearchResults(rows) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 25) throw new Error('Anukriti can write 1 to 25 approved research rows at a time.');
  return rows.map(row => [row.searchTerm, row.metric, row.value, row.sourceUrl, row.checkedAt, row.status]
    .map(packedResearchValue).join(fieldSeparator)).join(recordSeparator);
}

export function parseResearchWriteReceipt(payload) {
  const [marker, rows = '0', documentName = '', sheetName = '', tableName = ''] = String(payload || '').trim().split(recordSeparator);
  if (marker !== 'ANUKRITI_NUMBERS_WRITE_V1' || !Number.isInteger(Number(rows))) throw new Error('Numbers did not confirm the approved table update.');
  return { rows: Number(rows), documentName, sheetName, tableName };
}

export async function writeNumbersResearchResults(rows, run = runFile) {
  if (process.platform !== 'darwin') throw new Error('Numbers research write-back is available only on macOS.');
  if (!fs.existsSync(numbersApp)) throw new Error('Apple Numbers is not installed in /Applications.');
  try {
    const { stdout } = await run('/usr/bin/osascript', ['-e', writeResearchResultsScript, serializeResearchResults(rows)], { timeout: 20_000, maxBuffer: 512 * 1024, windowsHide: true });
    return parseResearchWriteReceipt(stdout);
  } catch (error) {
    const message = error.stderr?.trim() || error.message || 'Numbers research results could not be written.';
    if (/not authorized|not permitted|automation/i.test(message)) throw new Error('macOS blocked the Numbers write. Allow Anukriti or your desktop app under System Settings → Privacy & Security → Automation, then try again.');
    throw new Error(message.replace(/^\d+:\d+: execution error: /, ''));
  }
}
