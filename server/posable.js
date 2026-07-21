import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';

// Deliberately stable for an on-camera fallback. Matches the POS/report workflow.
const DEMO_ROWS = [
  { id: 'TX-1042', date: '2026-07-01', customer: 'Ada O.', amount: 129.5 },
  { id: 'TX-1043', date: '2026-07-03', customer: 'Marcus L.', amount: 649.0 },
  { id: 'TX-1044', date: '', customer: 'Nora K.', amount: 72.25 },
  { id: 'TX-1045', date: '2026-07-08', customer: 'Ishan P.', amount: 215.0 },
  { id: 'TX-1046', date: '2026-07-11', customer: 'Sam R.', amount: 880.0 }
];

export async function getTransactions() {
  // This is intentionally opt-in: POSable credentials and DOM can rotate.
  // Keep browser launch visible in the app/demo by setting headless:false locally.
  if (process.env.LIVE_POSABLE !== 'true') return { rows: DEMO_ROWS, source: 'POSable demo snapshot' };
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  try {
    await page.goto(process.env.POSABLE_URL, { waitUntil: 'domcontentloaded' });
    // Validate/update these locators against POSable before a live recording.
    await page.getByLabel(/email|username/i).fill(process.env.POSABLE_USERNAME);
    await page.getByLabel(/password/i).fill(process.env.POSABLE_PASSWORD);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.getByText(/reports|transactions|sales/i).first().click();
    await page.waitForTimeout(1000);
    // Adapter boundary: selector work belongs here, not in route/UI logic.
    throw new Error('Live POSable table selectors need a one-time rehearsal before use.');
  } finally { await browser.close(); }
}

export function validate(rows, profile) {
  const included = rows.filter(row => !profile.excludedIds.includes(row.id));
  return included.map(row => ({
    ...row,
    flags: [row.amount > profile.threshold && `Over $${profile.threshold}`, profile.requireDate && !row.date && 'Missing date'].filter(Boolean)
  }));
}

export async function writeWorkbook(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Anukriti review');
  sheet.columns = [
    { header: 'Transaction ID', key: 'id', width: 18 }, { header: 'Date', key: 'date', width: 16 },
    { header: 'Customer', key: 'customer', width: 22 }, { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Validation flags', key: 'flags', width: 28 }
  ];
  rows.forEach(row => sheet.addRow({ ...row, flags: row.flags.join('; ') }));
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
  sheet.getColumn('amount').numFmt = '$#,##0.00';
  const filename = `anukriti-${Date.now()}.xlsx`;
  const target = path.resolve('output', filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await workbook.xlsx.writeFile(target);
  return `/output/${filename}`;
}
