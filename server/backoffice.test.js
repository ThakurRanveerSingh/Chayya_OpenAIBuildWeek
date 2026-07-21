import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { approvedWorkbookPath, backofficeSummary, decideInvoice, loadBackofficeQueue, optimizeBackofficeProcess, readDemoSource, readRoutingRules, recordBackofficeProcess, runBackofficeDemo } from './backoffice.js';

test('reads the bundled Website 1 invoices and routes them through Excel-backed mapping', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'anukriti-backoffice-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const db = {};
  const options = { mappingWorkbookPath: path.join(directory, 'internal-finance-mapping.xlsx'), outputDirectory: path.join(directory, 'output') };

  assert.equal(readDemoSource().length, 10);
  const rules = readRoutingRules();
  assert.equal(rules.version, '1.0');
  assert.equal(rules.noTouchAmountLimit, 5000);
  const queue = loadBackofficeQueue(db, 'owner-1');
  assert.equal(queue.status, 'Queued');
  assert.equal(queue.source.recordCount, 10);
  const firstRun = await runBackofficeDemo(db, 'owner-1', { ...options, invoices: queue.records, queueBatchId: queue.id, rules });

  assert.deepEqual(firstRun.analytics, { total: 10, passed: 5, failed: 5, passRate: 50, approvedAmount: 11430, exceptionAmount: 9570 });
  assert.equal(firstRun.decisions.find(item => item.invoiceId === 'ACME-1001').mapping.vendorId, 'VEN-100');
  assert.match(firstRun.decisions.find(item => item.invoiceId === 'ACME-1004').reasons.join(' '), /no-touch limit/);
  assert.equal(firstRun.proof.queueBatchId, queue.id);
  assert.equal(firstRun.proof.rulesVersion, '1.0');
  assert.ok(fs.existsSync(path.join(directory, 'internal-finance-mapping.xlsx')));
  assert.ok(fs.existsSync(path.join(directory, 'output', firstRun.approvedWorkbook)));

  const secondQueue = loadBackofficeQueue(db, 'owner-1');
  const secondRun = await runBackofficeDemo(db, 'owner-1', { ...options, invoices: secondQueue.records, queueBatchId: secondQueue.id, rules });
  const summary = backofficeSummary(db, 'owner-1');
  assert.equal(summary.latestRun.id, secondRun.id);
  assert.equal(summary.financeHub.length, 5, 're-running updates FinanceHub instead of duplicating invoices');
  assert.equal(summary.exceptionDesk.length, 5, 're-running updates ExceptionDesk instead of duplicating exceptions');
  assert.equal(approvedWorkbookPath(firstRun), path.resolve('output', firstRun.approvedWorkbook));
});

test('routes incomplete or unmapped invoices to review with an explanation', () => {
  const decision = decideInvoice({ invoiceId: 'ACME-X', supplier: 'New Supplier', poNumber: '', amount: 120 }, []);
  assert.equal(decision.status, 'Exception');
  assert.deepEqual(decision.reasons, ['Missing purchase order']);
  assert.equal(decision.target, 'Website 3 · ExceptionDesk');
});

test('captures a transparent business process and safely creates an optimized replay plan', () => {
  const db = {};
  const captured = recordBackofficeProcess(db, 'owner-1');
  assert.equal(captured.status, 'Recorded');
  assert.equal(captured.intent.label, 'Invoice routing orchestration');
  assert.equal(captured.intent.method, 'structured_process_classification');
  assert.equal(captured.rawPlan.length, 6);
  assert.deepEqual(captured.rawPlan.map(step => step.stage), ['Source table', 'Queue', 'Rules document', 'Background worker', 'FinanceHub / ExceptionDesk', 'Proof']);
  const optimized = optimizeBackofficeProcess(db, 'owner-1', captured.id).processJob;
  assert.equal(optimized.status, 'Ready to run');
  assert.equal(optimized.version, 2);
  assert.equal(optimized.rawPlan.length, 6, 'the original capture is retained');
  assert.equal(optimized.optimizedPlan.length, 4);
  assert.match(optimized.optimization.join(' '), /no outcome is skipped/);
  assert.equal(backofficeSummary(db, 'owner-1').latestProcessJob.id, captured.id);
});
