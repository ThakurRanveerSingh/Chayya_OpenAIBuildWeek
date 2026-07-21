import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const projectRoot = path.resolve(import.meta.dirname, '..');
const recordedCode = `import { test, expect } from '@playwright/test';

test('weekly report', async ({ page }) => {
  await page.goto('https://example.com');
  await page.goto('https://example.com');
  await page.getByLabel('Report email').fill('ada@example.com');
  await page.getByLabel('Report email').fill('ada@example.com');
  await page.getByRole('button', { name: 'Download report' }).click();
});
`;
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const availablePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

async function waitForUrl(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* Wait for the local process. */ }
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

test('a user records a browser job and receives the captured code in the UI', { timeout: 45_000 }, async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'anukriti-browser-'));
  const bin = path.join(directory, 'bin');
  const fakeNpx = path.join(bin, 'npx');
  fs.mkdirSync(bin);
  fs.writeFileSync(fakeNpx, `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
if (args.includes('--output')) {
  const output = args[args.indexOf('--output') + 1];
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, "import { test, expect } from '@playwright/test';\\n\\ntest('weekly report', async ({ page }) => {\\n  await page.goto('https://example.com');\\n");
  setTimeout(() => fs.writeFileSync(output, ${JSON.stringify(recordedCode)}), 3000);
} else {
  console.log('1 passed (' + (process.env.ANUKRITI_RUN_MODE || 'background') + ' simulated saved browser job)');
}
`);
  fs.chmodSync(fakeNpx, 0o755);
  const apiPort = await availablePort();
  const uiPort = await availablePort();
  const api = spawn(process.execPath, [path.join(projectRoot, 'server/index.js')], {
    cwd: directory,
    env: { ...process.env, PORT: String(apiPort), PATH: `${bin}:${process.env.PATH}` },
    stdio: 'ignore'
  });
  const ui = spawn('npm', ['exec', 'vite', '--', '--host', '127.0.0.1', '--port', String(uiPort)], {
    cwd: projectRoot,
    env: { ...process.env, API_PORT: String(apiPort) },
    stdio: 'ignore'
  });
  const browser = await chromium.launch();
  t.after(async () => {
    await browser.close();
    api.kill(); ui.kill();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await waitForUrl(`http://127.0.0.1:${uiPort}`);
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${uiPort}`, { waitUntil: 'networkidle' });
  await page.getByText('chayya', { exact: true }).waitFor();
  await page.getByText('THE SHADOW OF YOUR BEST WORK', { exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Turn one hard-won route into a trusted job.' }).waitFor();
  assert.match(await page.getByLabel('Your first mission').innerText(), /Chart the route[\s\S]*Inspect the log[\s\S]*Keep the proof/);
  await page.getByRole('button', { name: 'Ask your guide' }).click();
  await page.getByText(/Welcome to Chayya\. I can explain how to turn one carefully completed task/).waitFor();
  await page.getByRole('button', { name: 'Is my data private?' }).click();
  await page.getByText(/does not make a model or web call with your message/).waitFor();
  await page.getByRole('button', { name: 'Close personal assistant' }).click();
  await page.getByRole('button', { name: 'Need an account? Create one' }).click();
  await page.getByPlaceholder('Ada Lovelace').fill('Ada Lovelace');
  await page.getByPlaceholder('you@company.com').fill('ada@example.com');
  await page.getByPlaceholder('At least 10 characters').fill('correct-horse-battery-staple');
  await page.getByRole('button', { name: 'Create secure account →' }).click();
  await page.getByRole('button', { name: 'Today' }).click();
  await page.getByRole('heading', { name: 'Make today reusable.' }).waitFor({ timeout: 8000 });
  await page.getByLabel('What would make today successful?').fill('Forge one trusted reusable weekly report job.');
  await page.getByRole('button', { name: 'Start today →' }).click();
  await page.getByLabel('Focus block').fill('Review the reusable job path');
  await page.getByRole('button', { name: 'Log focus block →' }).click();
  await page.getByText('Logged 25 minutes: Review the reusable job path').waitFor({ timeout: 8000 });
  assert.match(await page.locator('.workdayConsole').innerText(), /FOCUS TIME[\s\S]*25/);
  await page.getByRole('button', { name: 'Ask your guide' }).click();
  await page.getByRole('button', { name: 'How do live waits work?' }).click();
  await page.getByText(/Live waits are added while the recorder is open/).waitFor();
  await page.getByRole('button', { name: 'Close personal assistant' }).click();
  await page.getByRole('button', { name: 'Back-office demo' }).click();
  await page.getByRole('heading', { name: 'Route invoices before a team touches them.' }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Capture this process as a reusable job →' }).click();
  await page.getByText(/Business process captured/).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.processCapture').innerText(), /Invoice routing orchestration[\s\S]*Source table[\s\S]*FinanceHub \/ ExceptionDesk[\s\S]*Proof/);
  await page.getByRole('button', { name: 'Review & optimize saved process →' }).click();
  await page.getByText(/Optimized execution plan saved/).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.processCapture').innerText(), /SAVED OPTIMIZED PLAN[\s\S]*no outcome is skipped/);
  await page.getByRole('button', { name: 'Run optimized saved job →' }).click();
  await page.getByText(/Saved job started/).waitFor({ timeout: 8000 });
  await page.getByText('5 invoices posted automatically').waitFor({ timeout: 8000 });
  assert.match(await page.locator('.analyticsPanel').innerText(), /50%/);
  assert.match(await page.locator('.proofPanel').innerText(), /Proof complete|Proof report ready|3 Excel mappings used/);
  assert.match(await page.locator('.decisionPanel').innerText(), /ACME-1004[\s\S]*Exception/);
  const proofDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download proof report' }).click();
  const downloadedProof = await proofDownload;
  assert.match(downloadedProof.suggestedFilename(), /backoffice-proof\.json/);
  const financeHubDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download mapped Excel' }).click();
  const downloadedWorkbook = await financeHubDownload;
  assert.match(downloadedWorkbook.suggestedFilename(), /financehub-approved-.*\.xlsx/);
  const financeTargetLink = page.getByRole('link', { name: 'Open FinanceHub target ↗' });
  assert.equal(await financeTargetLink.count(), 1);
  const financeTarget = page.waitForEvent('popup');
  await financeTargetLink.click();
  const financeHubPage = await financeTarget;
  await financeHubPage.getByRole('table', { name: 'FinanceHub invoice queue' }).waitFor({ timeout: 8000 });
  assert.match(await financeHubPage.locator('body').innerText(), /VEN-100/);
  await financeHubPage.close();
  const exceptionTargetLink = page.getByRole('link', { name: 'Open ExceptionDesk target ↗' });
  assert.equal(await exceptionTargetLink.count(), 1);
  const exceptionTarget = page.waitForEvent('popup');
  await exceptionTargetLink.click();
  const exceptionDeskPage = await exceptionTarget;
  await exceptionDeskPage.getByRole('table', { name: 'ExceptionDesk review queue' }).waitFor({ timeout: 8000 });
  assert.match(await exceptionDeskPage.locator('body').innerText(), /Missing purchase order/);
  await exceptionDeskPage.close();
  await page.getByRole('button', { name: 'New browser job' }).click();
  await page.getByRole('button', { name: 'Add four public-search starter jobs instead' }).click();
  await page.getByRole('heading', { name: 'FIFA World Cup news and scores insights' }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: /Library/ }).click();
  await page.locator('.workflowCard').first().waitFor({ timeout: 8000 });
  assert.equal(await page.locator('.workflowCard').count(), 4);
  await page.getByRole('button', { name: 'New browser job' }).click();
  await page.getByPlaceholder('e.g. Download my weekly report').fill('Download weekly report');
  await page.getByPlaceholder('https://app.example.com').fill('https://example.com');
  await page.getByRole('button', { name: 'Create browser job →' }).click();
  await page.getByRole('heading', { name: 'Teach it once. Prove the route.' }).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.jobJourney').innerText(), /Next: Capture/);
  await page.getByRole('button', { name: 'Record this job' }).click();
  await page.getByRole('heading', { name: 'Set a pause before your next action.' }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Add a 2s pause after step 01' }).click();
  await page.getByText(/Aegis Guide queued a 2s wait after observed step 1/).waitFor({ timeout: 8000 });
  await page.getByText('Exact recorded steps').waitFor({ timeout: 8000 });
  await page.getByRole('heading', { name: 'Run the route with shared rules.' }).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.sopRuleBook').innerText(), /AUTOMATIC[\s\S]*Enter information in “Report email”[\s\S]*Known selector-risk checks passed/);
  const sopDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SOP & Rule Book (.md)' }).click();
  assert.match((await sopDownload).suggestedFilename(), /\.sop\.md/);
  assert.match(await page.locator('.jobJourney').innerText(), /Aegis check[\s\S]*Repeatability check passed/);
  assert.match(await page.locator('.stepList').innerText(), /Enter information in “Report email”/);
  await page.getByRole('heading', { name: 'Should the browser pause before the next action?' }).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.matchdayCoach').innerText(), /2s pause selected/);
  await page.getByRole('button', { name: 'Prepare visible rehearsal →' }).click();
  await page.getByText('What changed before saving').waitFor({ timeout: 8000 });
  await page.getByText('OPTIMIZED, RUNNABLE PLAYWRIGHT CODE').waitFor({ timeout: 8000 });
  assert.match(await page.locator('.code pre').innerText(), /Download report/);
  assert.match(await page.locator('.code pre').innerText(), /waitForTimeout\(2000\)/);
  assert.match(await page.locator('.optimization').innerText(), /Removed repeated/);
  await page.getByPlaceholder('e.g. Ask before submitting the final report.').fill('Ask before submitting the final report.');
  await page.getByRole('button', { name: 'Save note' }).click();
  await page.getByRole('status').getByText('Note saved to this job.', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Update saved job code →' }).click();
  await page.getByText(/Reusable job prepared/).waitFor({ timeout: 8000 });
  assert.match(await page.locator('.code pre').innerText(), /Review note: Ask for confirmation before a submit, send, purchase, or delete action/);
  await page.getByRole('button', { name: 'Set up visible rehearsal →' }).click();
  await page.getByRole('radio', { name: 'Visible browser' }).check();
  assert.equal(await page.getByRole('radio', { name: 'Background' }).isDisabled(), true);
  await page.getByLabel('I reviewed this job and want to run it.').check();
  await page.getByRole('button', { name: 'Open visible browser →' }).click();
  await page.getByRole('heading', { name: 'Saved browser checks passed.' }).waitFor({ timeout: 8000 });
  const proofText = await page.locator('.runResult').innerText();
  assert.match(proofText, /1 saved browser check passed/);
  assert.match(proofText, /Visible browser/);
  assert.match(proofText, /SAVED VERSION/);
  assert.equal(await page.getByLabel('I reviewed this job and want to run it.').isChecked(), false, 'a completed run requires fresh confirmation for any retry');
  await page.getByText('Technical details for troubleshooting').click();
  assert.match(await page.locator('.technicalDetails pre').innerText(), /1 passed[\s\S]*visible simulated/);
  await page.getByText('Reusable job ready').waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Run again in background →' }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Today' }).click();
  await page.getByRole('heading', { name: 'Make today reusable.' }).waitFor({ timeout: 8000 });
  await page.getByText('FOCUS TIME', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('Created job “Download weekly report”').waitFor({ timeout: 8000 });
  assert.match(await page.locator('.workdayConsole').innerText(), /JOBS FORGED[\s\S]*1[\s\S]*REUSABLE ROUTES[\s\S]*1[\s\S]*REPLAYS PROVEN[\s\S]*1/);
  await page.getByLabel('End-of-day note Optional').fill('Visible rehearsal passed; the route is ready to reuse.');
  await page.getByRole('button', { name: 'Close today →' }).click();
  await page.getByText('Today’s work is safely logged.').waitFor({ timeout: 8000 });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Clear today’s ledger' }).click();
  await page.getByRole('heading', { name: 'Set a morning intention.' }).waitFor({ timeout: 8000 });
});
