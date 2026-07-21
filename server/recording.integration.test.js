import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const recordedCode = `import { test, expect } from '@playwright/test';

test('weekly report', async ({ page }) => {
  await page.goto('https://example.com');
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

async function waitForApi(port) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return;
    } catch { /* Wait for the server process. */ }
    await wait(100);
  }
  throw new Error('API did not start for recorder integration test.');
}

const api = async (port, route, body, token, method) => {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, data: await response.json() };
};

test('turns a completed recorder capture into downloadable runnable code', { timeout: 15000 }, async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'anukriti-recorder-'));
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
  setTimeout(() => fs.writeFileSync(output, ${JSON.stringify(recordedCode)}), 700);
} else {
  if (!args.includes('--config')) process.exitCode = 1;
  if ((process.env.ANUKRITI_TEST_FILE || '').includes('broken-report')) {
    console.error("Error: locator.click: Test timeout of 90000ms exceeded. Waiting for locator('button').");
    console.log('1 failed (visible simulated saved browser job)');
    process.exitCode = 1;
  } else {
    console.log((args.includes('--config') ? '1 passed' : '0 passed') + ' (' + (process.env.ANUKRITI_RUN_MODE || 'background') + ' simulated saved browser job)');
  }
}
`);
  fs.chmodSync(fakeNpx, 0o755);
  const port = await availablePort();
  const server = spawn(process.execPath, [path.join(projectRoot, 'server/index.js')], {
    cwd: directory,
    env: { ...process.env, PORT: String(port), PATH: `${bin}:${process.env.PATH}` },
    stdio: 'ignore'
  });
  t.after(() => {
    server.kill();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await waitForApi(port);
  const readiness = await fetch(`http://127.0.0.1:${port}/api/ready`);
  assert.equal(readiness.status, 200);
  const metrics = await fetch(`http://127.0.0.1:${port}/metrics`);
  assert.equal(metrics.status, 200);
  assert.match(await metrics.text(), /anukriti_http_requests_total/);
  const unauthorized = await api(port, '/api/workflows');
  assert.equal(unauthorized.status, 401);
  const account = await api(port, '/api/auth/register', { name: 'Ada Lovelace', email: 'ada@example.com', password: 'correct-horse-battery-staple' });
  assert.equal(account.status, 201);
  const token = account.data.token;
  const noWorkday = await api(port, '/api/workday/today', undefined, token);
  assert.equal(noWorkday.status, 200);
  assert.equal(noWorkday.data.workday, null);
  const startedWorkday = await api(port, '/api/workday/start', { intention: 'Create and verify a reusable weekly report job.' }, token);
  assert.equal(startedWorkday.status, 201);
  assert.equal(startedWorkday.data.workday.status, 'Active');
  const focusBlock = await api(port, '/api/workday/focus', { title: 'Record the weekly report', minutes: 25 }, token);
  assert.equal(focusBlock.status, 201);
  assert.equal(focusBlock.data.workday.summary.focusMinutes, 25);
  const backofficeBefore = await api(port, '/api/backoffice/demo', undefined, token);
  assert.equal(backofficeBefore.status, 200);
  assert.equal(backofficeBefore.data.source.invoices.length, 10);
  assert.equal(backofficeBefore.data.rules.version, '1.0');
  const capturedProcess = await api(port, '/api/backoffice/demo/process-jobs/record', {}, token);
  assert.equal(capturedProcess.status, 201);
  assert.equal(capturedProcess.data.processJob.status, 'Recorded');
  assert.equal(capturedProcess.data.processJob.rawPlan.length, 6);
  assert.equal(capturedProcess.data.processJob.intent.method, 'structured_process_classification');
  const optimizedProcess = await api(port, `/api/backoffice/demo/process-jobs/${capturedProcess.data.processJob.id}/optimize`, {}, token);
  assert.equal(optimizedProcess.status, 200);
  assert.equal(optimizedProcess.data.processJob.status, 'Ready to run');
  assert.equal(optimizedProcess.data.processJob.optimizedPlan.length, 4);
  const backgroundRouting = await api(port, `/api/backoffice/demo/process-jobs/${capturedProcess.data.processJob.id}/run`, {}, token);
  assert.equal(backgroundRouting.status, 202);
  assert.equal(backgroundRouting.data.job.status, 'Running');
  assert.equal(backgroundRouting.data.queue.status, 'Processing');
  assert.equal(backgroundRouting.data.queue.source.recordCount, 10);
  const duplicateStart = await api(port, `/api/backoffice/demo/process-jobs/${capturedProcess.data.processJob.id}/run`, {}, token);
  assert.equal(duplicateStart.status, 409);
  let completedBackoffice;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    completedBackoffice = await api(port, '/api/backoffice/demo', undefined, token);
    if (completedBackoffice.data.latestJob?.status !== 'Running') break;
    await wait(100);
  }
  assert.equal(completedBackoffice.data.latestJob.status, 'Completed');
  assert.equal(completedBackoffice.data.latestProcessJob.status, 'Ready to run');
  assert.equal(completedBackoffice.data.latestProcessJob.lastExecution.status, 'Completed');
  assert.deepEqual(completedBackoffice.data.latestRun.analytics, { total: 10, passed: 5, failed: 5, passRate: 50, approvedAmount: 11430, exceptionAmount: 9570 });
  assert.equal(completedBackoffice.data.latestRun.processJobId, capturedProcess.data.processJob.id);
  assert.equal(completedBackoffice.data.latestRun.proof.processJobId, capturedProcess.data.processJob.id);
  assert.equal(completedBackoffice.data.financeHub.length, 5);
  assert.equal(completedBackoffice.data.exceptionDesk.length, 5);
  assert.match(completedBackoffice.data.latestRun.proof.sourceFingerprint, /^[a-f0-9]{12}$/);
  assert.equal(completedBackoffice.data.latestRun.proof.mappingRows, 3);
  const financeHubExport = await fetch(`http://127.0.0.1:${port}/api/backoffice/demo/runs/${completedBackoffice.data.latestRun.id}/approved-workbook`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(financeHubExport.status, 200);
  assert.match(financeHubExport.headers.get('content-type'), /spreadsheetml/);
  assert.ok((await financeHubExport.arrayBuffer()).byteLength > 1000);
  const proofExport = await fetch(`http://127.0.0.1:${port}/api/backoffice/demo/runs/${completedBackoffice.data.latestRun.id}/proof`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(proofExport.status, 200);
  assert.equal((await proofExport.json()).rules.version, '1.0');
  const repeatedProcessRun = await api(port, `/api/backoffice/demo/process-jobs/${capturedProcess.data.processJob.id}/run`, {}, token);
  assert.equal(repeatedProcessRun.status, 202);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    completedBackoffice = await api(port, '/api/backoffice/demo', undefined, token);
    if (completedBackoffice.data.latestJob?.status !== 'Running') break;
    await wait(100);
  }
  assert.equal(completedBackoffice.data.latestProcessJob.executionHistory.length, 2);
  assert.equal(completedBackoffice.data.latestProcessJob.lastExecution.status, 'Completed');
  assert.equal(completedBackoffice.data.financeHub.length, 5, 'a replay updates rather than duplicates target records');
  assert.equal(completedBackoffice.data.exceptionDesk.length, 5, 'a replay updates rather than duplicates exceptions');
  const starters = await api(port, '/api/workflows/starter-jobs', {}, token);
  assert.equal(starters.status, 201);
  assert.equal(starters.data.workflows.length, 4);
  assert.ok(starters.data.workflows.every(item => item.status === 'Ready to run'));
  const startersAgain = await api(port, '/api/workflows/starter-jobs', {}, token);
  assert.equal(startersAgain.status, 200);
  assert.equal(startersAgain.data.workflows.length, 0);
  const workflow = await api(port, '/api/workflows', { name: 'Weekly report', startUrl: 'https://example.com', platform: 'browser' }, token);
  assert.equal(workflow.status, 201);
  const privateTarget = await api(port, '/api/workflows', { name: 'Private target', startUrl: 'http://127.0.0.1:3001', platform: 'browser' }, token);
  assert.equal(privateTarget.status, 400);
  const secondAccount = await api(port, '/api/auth/register', { name: 'Grace Hopper', email: 'grace@example.com', password: 'another-secure-password' });
  const forbidden = await api(port, `/api/workflows/${workflow.data.id}/recording`, undefined, secondAccount.data.token);
  assert.equal(forbidden.status, 403);
  const forbiddenProcess = await api(port, `/api/backoffice/demo/process-jobs/${capturedProcess.data.processJob.id}/run`, {}, secondAccount.data.token);
  assert.equal(forbiddenProcess.status, 404, 'another user cannot discover or run a saved process job they do not own');

  const beforeRecording = await api(port, `/api/workflows/${workflow.data.id}/generate`, {}, token);
  assert.equal(beforeRecording.status, 409);
  assert.match(beforeRecording.data.error, /No saved recording yet/);

  const started = await api(port, `/api/workflows/${workflow.data.id}/record`, {}, token);
  assert.equal(started.status, 200);
  assert.equal(started.data.workflow.status, 'Recording');

  let partialRecording;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    partialRecording = await api(port, `/api/workflows/${workflow.data.id}/recording`, undefined, token);
    if (partialRecording.data.ready) break;
    await wait(50);
  }
  assert.equal(partialRecording.data.ready, true, 'a codegen file can be readable before the recorder closes');
  assert.equal(partialRecording.data.workflow.status, 'Recording', 'partial codegen output must never finalize the capture');
  const liveWait = await api(port, `/api/workflows/${workflow.data.id}/recording/waits`, { afterStepNumber: 1, milliseconds: 2000 }, token);
  assert.equal(liveWait.status, 200);
  assert.deepEqual(liveWait.data.workflow.pendingWaits, [{ afterStepNumber: 1, milliseconds: 2000 }]);

  let recording;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    recording = await api(port, `/api/workflows/${workflow.data.id}/recording`, undefined, token);
    if (recording.data.ready && recording.data.workflow.status === 'Recorded') break;
    await wait(100);
  }
  assert.equal(recording.data.ready, true);
  assert.equal(recording.data.workflow.status, 'Recorded');
  assert.deepEqual(recording.data.workflow.waits, [{ afterStepNumber: 1, milliseconds: 2000 }], 'a wait queued during recording is retained after the recorder closes');
  assert.match(recording.data.code, /Download report/);
  assert.equal(recording.data.workflow.sop.steps.length, 2);
  assert.equal(recording.data.workflow.sop.revision, 1);
  const sop = await fetch(`http://127.0.0.1:${port}/api/workflows/${workflow.data.id}/sop`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(sop.status, 200);
  assert.match(sop.headers.get('content-disposition') || '', /\.sop\.md/);
  const sopText = await sop.text();
  assert.match(sopText, /Weekly report — SOP & Rule Book/);
  assert.match(sopText, /Step 01/);
  assert.match(sopText, /Wait 2 seconds/);
  assert.match(sopText, /Download report/);

  const configuredWait = await api(port, `/api/workflows/${workflow.data.id}/waits`, { afterStepNumber: 2, milliseconds: 1000 }, token);
  assert.equal(configuredWait.status, 200);
  assert.deepEqual(configuredWait.data.workflow.waits, [{ afterStepNumber: 1, milliseconds: 2000 }, { afterStepNumber: 2, milliseconds: 1000 }]);
  assert.equal(configuredWait.data.workflow.status, 'Recorded');
  assert.equal(configuredWait.data.workflow.sop.revision, 2);

  const generated = await api(port, `/api/workflows/${workflow.data.id}/generate`, {}, token);
  assert.equal(generated.status, 200);
  assert.equal(generated.data.workflow.status, 'Ready to run');
  assert.equal(generated.data.workflow.recordedSteps.length, 2);
  assert.equal(generated.data.workflow.optimizedSteps.length, 4);
  assert.match(generated.data.code, /Recorded by Chayya/);
  assert.match(generated.data.code, /waitForTimeout\(2000\)/);
  assert.match(generated.data.code, /waitForTimeout\(1000\)/);
  assert.match(generated.data.code, /getByRole\('button'/);
  assert.equal(generated.data.workflow.sop.revision, 3);

  const savedNote = await api(port, `/api/workflows/${workflow.data.id}/feedback`, { feedback: 'Ask before submitting the final report.' }, token);
  assert.equal(savedNote.status, 200);
  assert.equal(savedNote.data.requiresRebuild, true);
  assert.equal(savedNote.data.workflow.status, 'Recorded');
  assert.equal(savedNote.data.workflow.script, null, 'a note must not leave a stale generated job runnable');
  assert.equal(savedNote.data.workflow.sop.revision, 4);
  const regenerated = await api(port, `/api/workflows/${workflow.data.id}/generate`, {}, token);
  assert.equal(regenerated.status, 200);
  assert.equal(regenerated.data.workflow.status, 'Ready to run');
  assert.match(regenerated.data.code, /Review note: Ask for confirmation before a submit, send, purchase, or delete action/);

  const file = await fetch(`http://127.0.0.1:${port}${regenerated.data.url}`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(file.status, 200);
  assert.match(await file.text(), /Download report/);

  const unconfirmedRun = await api(port, `/api/workflows/${workflow.data.id}/run`, { runMode: 'visible' }, token);
  assert.equal(unconfirmedRun.status, 400);
  const invalidMode = await api(port, `/api/workflows/${workflow.data.id}/run`, { confirmed: true, runMode: 'sideways' }, token);
  assert.equal(invalidMode.status, 400);
  const backgroundBeforeVisible = await api(port, `/api/workflows/${workflow.data.id}/run`, { confirmed: true, runMode: 'background' }, token);
  assert.equal(backgroundBeforeVisible.status, 409);
  assert.match(backgroundBeforeVisible.data.error, /exact saved version visibly/i);
  const startedRun = await api(port, `/api/workflows/${workflow.data.id}/run`, { confirmed: true, runMode: 'visible' }, token);
  assert.equal(startedRun.status, 200);
  assert.equal(startedRun.data.workflow.lastRun.status, 'Running');
  assert.equal(startedRun.data.workflow.lastRun.runMode, 'visible');

  let completedRun;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    completedRun = await api(port, `/api/workflows/${workflow.data.id}/run`, undefined, token);
    if (completedRun.data.lastRun?.status !== 'Running') break;
    await wait(100);
  }
  assert.equal(completedRun.data.lastRun.status, 'Passed');
  assert.equal(completedRun.data.lastRun.runMode, 'visible');
  assert.equal(completedRun.data.lastRun.proof.verdict, 'passed');
  assert.equal(completedRun.data.lastRun.proof.testCounts.passed, 1);
  assert.equal(completedRun.data.lastRun.execution.workflowVersion, 3);
  assert.match(completedRun.data.lastRun.technicalLog, /1 passed/);
  assert.equal(completedRun.data.lastRun.output, undefined, 'raw output is no longer mixed into the normal result response');
  const visibleLog = await api(port, `/api/workflows/${workflow.data.id}/runs/${completedRun.data.lastRun.id}/log`, undefined, token);
  assert.equal(visibleLog.status, 200);
  assert.match(visibleLog.data.log, /visible simulated/);

  const backgroundRun = await api(port, `/api/workflows/${workflow.data.id}/run`, { confirmed: true, runMode: 'background' }, token);
  assert.equal(backgroundRun.status, 200);
  assert.equal(backgroundRun.data.workflow.lastRun.runMode, 'background');
  for (let attempt = 0; attempt < 50; attempt += 1) {
    completedRun = await api(port, `/api/workflows/${workflow.data.id}/run`, undefined, token);
    if (completedRun.data.lastRun?.status !== 'Running') break;
    await wait(100);
  }
  assert.equal(completedRun.data.lastRun.status, 'Passed');
  assert.equal(completedRun.data.lastRun.runMode, 'background');
  assert.equal(completedRun.data.lastRun.proof.verdict, 'passed');
  assert.match(completedRun.data.lastRun.technicalLog, /background simulated/);
  const changedWait = await api(port, `/api/workflows/${workflow.data.id}/waits`, { afterStepNumber: 2, milliseconds: 1500 }, token);
  assert.equal(changedWait.status, 200);
  const changedVersion = await api(port, `/api/workflows/${workflow.data.id}/generate`, {}, token);
  assert.equal(changedVersion.status, 200);
  const staleVersionBackground = await api(port, `/api/workflows/${workflow.data.id}/run`, { confirmed: true, runMode: 'background' }, token);
  assert.equal(staleVersionBackground.status, 409, 'a changed job must earn a new visible rehearsal before background replay');

  const brokenWorkflow = await api(port, '/api/workflows', { name: 'Broken report', startUrl: 'https://example.com', platform: 'browser' }, token);
  assert.equal(brokenWorkflow.status, 201);
  await api(port, `/api/workflows/${brokenWorkflow.data.id}/record`, {}, token);
  let brokenRecording;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    brokenRecording = await api(port, `/api/workflows/${brokenWorkflow.data.id}/recording`, undefined, token);
    if (brokenRecording.data.ready && brokenRecording.data.workflow.status === 'Recorded') break;
    await wait(100);
  }
  assert.equal(brokenRecording.data.workflow.status, 'Recorded');
  const brokenGenerated = await api(port, `/api/workflows/${brokenWorkflow.data.id}/generate`, {}, token);
  assert.equal(brokenGenerated.status, 200);
  const brokenStarted = await api(port, `/api/workflows/${brokenWorkflow.data.id}/run`, { confirmed: true, runMode: 'visible' }, token);
  assert.equal(brokenStarted.status, 200);
  let brokenCompleted;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    brokenCompleted = await api(port, `/api/workflows/${brokenWorkflow.data.id}/run`, undefined, token);
    if (brokenCompleted.data.lastRun?.status !== 'Running') break;
    await wait(100);
  }
  assert.equal(brokenCompleted.data.lastRun.status, 'Failed');
  assert.equal(brokenCompleted.data.lastRun.proof.issue.category, 'page control changed');
  assert.match(brokenCompleted.data.lastRun.proof.nextSafeAction, /Run visibly/i);
  assert.match(brokenCompleted.data.lastRun.technicalLog, /locator\.click/);
  const activeWorkday = await api(port, '/api/workday/today', undefined, token);
  assert.equal(activeWorkday.data.workday.summary.jobsCreated, 2);
  assert.equal(activeWorkday.data.workday.summary.jobsPrepared, 2);
  assert.equal(activeWorkday.data.workday.summary.replaysPassed, 2);
  const closedWorkday = await api(port, '/api/workday/end', { reflection: 'The visible replay passed before I used a background replay.' }, token);
  assert.equal(closedWorkday.status, 200);
  assert.equal(closedWorkday.data.workday.status, 'Closed');
  const clearedWorkday = await api(port, '/api/workday/today', undefined, token, 'DELETE');
  assert.equal(clearedWorkday.status, 200);
  assert.equal(clearedWorkday.data.workday, null);
  const emptyWorkday = await api(port, '/api/workday/today', undefined, token);
  assert.equal(emptyWorkday.data.workday, null);
  const secondClear = await api(port, '/api/workday/today', undefined, token, 'DELETE');
  assert.equal(secondClear.status, 404);
});
