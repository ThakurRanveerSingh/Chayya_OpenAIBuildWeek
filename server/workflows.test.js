import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { analyzeRecording, applyConfiguredWaits, buildSopRuleBook, configureWait, createControlledDemoWorkflows, createStarterWorkflows, createWorkflow, generateScript, getRecording, hasVisiblePassForExecution, optimizeRecording, parseFeedback, recordingFilename, runScript, summarizePlaywrightRun, writeSopRuleBook } from './workflows.js';

const originalCwd = process.cwd();
const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'anukriti-workflows-'));
process.chdir(testDirectory);

test.after(() => {
  process.chdir(originalCwd);
  fs.rmSync(testDirectory, { recursive: true, force: true });
});

test('creates a browser workflow with safe defaults', () => {
  const workflow = createWorkflow({ name: 'Weekly report', startUrl: 'https://example.com' });

  assert.equal(workflow.name, 'Weekly report');
  assert.equal(workflow.platform, 'browser');
  assert.equal(workflow.status, 'Draft');
  assert.deepEqual(workflow.rules, []);
});

test('learns confirmation and schedule rules without duplicating them', () => {
  const workflow = createWorkflow({ name: 'Invoice review' });
  const [updated, learned] = parseFeedback('Ask before sending and run every Friday', workflow);
  const [deduplicated] = parseFeedback('Ask before sending and run every Friday', updated);

  assert.deepEqual(learned, ['confirmation checkpoint', 'schedule: Ask before sending and run every Friday']);
  assert.equal(updated.status, 'Draft');
  assert.equal(updated.rules.length, 1);
  assert.equal(deduplicated.rules.length, 1);
  assert.equal(updated.schedule, 'Ask before sending and run every Friday');
});

test('creates user-facing execution proof without trusting noisy terminal output as the verdict', () => {
  const workflow = {
    ...createWorkflow({ name: 'Weekly report' }),
    version: 3,
    recordedSteps: [{ number: 1, summary: 'Open the weekly report', code: "await page.goto('https://example.com');" }],
    optimizedSteps: [{ number: 1, summary: 'Open the weekly report', code: "await page.goto('https://example.com');" }]
  };
  const execution = { workflowVersion: 3, scriptFingerprint: 'a1b2c3d4', recordedStepCount: 1, runnableStepCount: 1, configuredWaitCount: 0 };
  const passed = summarizePlaywrightRun(workflow, { status: 'Passed', runMode: 'visible', execution, output: '\u001b[32m1 passed\u001b[39m (12.3s)' });
  assert.equal(passed.proof.verdict, 'passed');
  assert.equal(passed.proof.testCounts.passed, 1);
  assert.match(passed.proof.summary, /visible rehearsal/i);
  assert.doesNotMatch(passed.technicalLog, /\u001b/);

  const failed = summarizePlaywrightRun(workflow, { status: 'Failed', runMode: 'visible', execution, output: "Error: locator.click: Test timeout of 90000ms exceeded.\npassword=should-not-appear" });
  assert.equal(failed.proof.verdict, 'failed');
  assert.equal(failed.proof.issue.category, 'page control changed');
  assert.match(failed.proof.nextSafeAction, /Run visibly/i);
  assert.match(failed.technicalLog, /password=\[redacted\]/i);

  workflow.lastRun = { status: 'Passed', runMode: 'visible', execution };
  assert.equal(hasVisiblePassForExecution(workflow, execution), true);
  assert.equal(hasVisiblePassForExecution(workflow, { ...execution, scriptFingerprint: 'changed' }), false, 'a changed saved script needs another visible rehearsal');
});

test('does not prepare code until browser steps have been recorded', () => {
  const workflow = createWorkflow({ name: 'Weekly report', startUrl: 'https://example.com' });

  assert.throws(() => generateScript(workflow), /No saved recording yet/);
  assert.throws(() => runScript(workflow), /Prepare code from a saved recording/);
});

test('creates four distinct, runnable starter research jobs only once per owner', () => {
  const db = { workflows: [] };
  const created = createStarterWorkflows(db, 'owner-1');

  assert.equal(created.length, 4);
  assert.equal(db.workflows.length, 4);
  assert.ok(created.every(workflow => workflow.status === 'Ready to run' && workflow.script && workflow.source === 'Verified starter template'));
  assert.ok(created.every(workflow => fs.existsSync(path.resolve('automations', workflow.script))));
  assert.equal(createStarterWorkflows(db, 'owner-1').length, 0);
  assert.equal(createStarterWorkflows(db, 'owner-2').length, 4);
});

test('creates five repeatable first-party demo jobs only once per owner', () => {
  const db = { workflows: [] };
  const created = createControlledDemoWorkflows(db, 'owner-1', 'http://127.0.0.1:3131');

  assert.equal(created.length, 5);
  assert.ok(created.every(workflow => workflow.controlledDemo && workflow.status === 'Ready to run' && workflow.recordingReliability.ok));
  assert.ok(created.every(workflow => workflow.script && fs.existsSync(path.resolve('automations', workflow.script))));
  assert.ok(created.every(workflow => workflow.recordingFile && workflow.sop?.filename && fs.existsSync(path.resolve('automations', workflow.sop.filename))));
  const student = created.find(workflow => workflow.controlledDemoKey === 'anukriti-study-brief');
  const teacher = created.find(workflow => workflow.controlledDemoKey === 'teacher-lesson-brief');
  assert.deepEqual(student.intent.safeguards, ['Use trusted sources chosen by the learner or teacher.', 'Keep explanations in the learner’s own words.', 'Review gaps with a teacher or peer before treating the work as complete.']);
  assert.deepEqual(teacher.intent.safeguards, ['Teacher selects and verifies trusted sources.', 'Teacher reviews activities and learner supports.', 'Teacher approves the brief before classroom use.']);
  assert.match(created[0].startUrl, /^http:\/\/127\.0\.0\.1:3131\/demo-websites\/anukriti-/);
  assert.equal(createControlledDemoWorkflows(db, 'owner-1', 'http://127.0.0.1:3131').length, 0);
});

test('shows exact recorded steps and safely removes only repeated consecutive actions', () => {
  const workflow = { ...createWorkflow({ name: 'Weekly report', startUrl: 'https://example.com' }), rules: ['Ask for confirmation before a submit.'] };
  workflow.recordingFile = recordingFilename(workflow);
  fs.mkdirSync('automations', { recursive: true });
  fs.writeFileSync(path.resolve('automations', workflow.recordingFile), "import { test, expect } from '@playwright/test';\n\ntest('download report', async ({ page }) => {\n  await page.goto('https://example.com');\n  await page.goto('https://example.com');\n  await page.getByLabel('Report email').fill('ada@example.com');\n  await page.getByLabel('Report email').fill('ada@example.com');\n  await page.getByRole('button', { name: 'Download' }).click();\n});\n");

  const recording = getRecording(workflow);
  const generated = generateScript(workflow);
  const analysis = analyzeRecording(recording.code);

  assert.equal(recording.ready, true);
  assert.equal(analysis.steps.length, 5);
  assert.equal(analysis.steps[2].summary, 'Enter information in “Report email”');
  assert.match(generated.filename, /^weekly-report-[a-f0-9]{8}-v2\.spec\.js$/);
  assert.match(generated.code, /Recorded by Chayya/);
  assert.match(generated.code, /Review note: Ask for confirmation before a submit/);
  assert.match(generated.code, /Removed repeated open https:\/\/example\.com/);
  assert.equal(generated.optimization.length, 2);
  assert.equal(generated.rawSteps.length, 5, 'the original capture remains available alongside the runnable plan');
  assert.equal(generated.steps.length, 3);
  assert.equal((generated.code.match(/await page\.goto\('https:\/\/example\.com'\)/g) || []).length, 1);
  assert.equal((generated.code.match(/fill\('ada@example\.com'\)/g) || []).length, 1);
  assert.match(generated.code, /getByRole\('button', \{ name: 'Download' \}\)\.click/);
  assert.ok(fs.existsSync(generated.path));
});

test('creates a detailed SOP and Rule Book from exact captured steps', () => {
  const workflow = {
    ...createWorkflow({ name: 'Invoice review', startUrl: 'https://example.com/invoices' }),
    captureVersion: 2,
    recordingFile: 'invoice-review-capture-2.recording.spec.js',
    recordedSteps: [
      { number: 1, kind: 'navigate', summary: 'Open https://example.com/invoices', code: "await page.goto('https://example.com/invoices');", requiresConfirmation: false },
      { number: 2, kind: 'click', summary: 'Click button “Submit invoice”', code: "await page.getByRole('button', { name: 'Submit invoice' }).click();", requiresConfirmation: true }
    ],
    waits: [{ afterStepNumber: 1, milliseconds: 2000 }],
    rules: ['Ask for confirmation before a submit, send, purchase, or delete action.'],
    recordingReliability: { ok: true, issues: [], summary: 'Reliability preflight passed.' }
  };
  const sop = buildSopRuleBook(workflow, '2026-07-20T12:00:00.000Z');
  workflow.sop = writeSopRuleBook(workflow, '2026-07-20T12:00:00.000Z');
  const text = fs.readFileSync(path.resolve('automations', workflow.sop.filename), 'utf8');

  assert.equal(sop.steps.length, 2);
  assert.equal(sop.steps[0].waitAfter.milliseconds, 2000);
  assert.match(sop.steps[1].rule, /explicit human confirmation/i);
  assert.match(text, /Invoice review — SOP & Rule Book/);
  assert.match(text, /Step 01/);
  assert.match(text, /Wait 2 seconds/);
  assert.match(text, /Submit invoice/);
});

test('preserves a Bing capture instead of silently converting it into a one-step template', () => {
  const recording = "import { test, expect } from '@playwright/test';\n\ntest('search WWE', async ({ page }) => {\n  await page.goto('https://www.bing.com/?toHttps=1');\n  await page.getByRole('combobox', { name: 'Enter your search here -' }).fill('WWE');\n  await page.locator('div').filter({ hasText: /^WWE$/ }).nth(3).click();\n  const page1Promise = page.waitForEvent('popup');\n  await page.getByText('WWE News, Results, Photos &').click();\n  const page1 = await page1Promise;\n});\n";
  const optimized = optimizeRecording(recording);

  assert.match(optimized.code, /\.nth\(3\)\.click/);
  assert.match(optimized.code, /waitForEvent\('popup'\)/);
  assert.match(optimized.optimizations[0], /exact recorded flow was preserved/);
  assert.equal(optimized.steps.length, 5);
});

test('keeps a fragile capture for review but refuses to save it as a reusable job', () => {
  const workflow = createWorkflow({ name: 'Fragile search', startUrl: 'https://www.bing.com' });
  workflow.recordingFile = recordingFilename(workflow);
  fs.mkdirSync('automations', { recursive: true });
  fs.writeFileSync(path.resolve('automations', workflow.recordingFile), "import { test } from '@playwright/test';\n\ntest('fragile search', async ({ page }) => {\n  await page.goto('https://www.bing.com');\n  await page.locator('div').filter({ hasText: /^WWE$/ }).nth(3).click();\n});\n");

  const recording = getRecording(workflow);
  assert.equal(recording.ready, true);
  assert.equal(recording.reliability.ok, false);
  assert.throws(() => generateScript(workflow), /reliability issue/);
});

test('redacts a live recording in memory without writing while codegen owns the file', () => {
  const workflow = createWorkflow({ name: 'Live private capture' });
  workflow.recordingFile = recordingFilename(workflow);
  fs.mkdirSync('automations', { recursive: true });
  const target = path.resolve('automations', workflow.recordingFile);
  const raw = "import { test } from '@playwright/test';\n\ntest('private', async ({ page }) => {\n  await page.getByLabel('Password').fill('do-not-write-this');\n});\n";
  fs.writeFileSync(target, raw);

  const preview = getRecording(workflow, { persistRedaction: false });

  assert.match(preview.code, /ANUKRITI_SECRET_1/);
  assert.equal(fs.readFileSync(target, 'utf8'), raw, 'live preview must not mutate an in-progress codegen file');
});

test('keeps actions performed in a popup tab in the captured-step review', () => {
  const recording = "import { test } from '@playwright/test';\n\ntest('new tab', async ({ page }) => {\n  await page.goto('https://example.com');\n  const page1Promise = page.waitForEvent('popup');\n  await page.getByRole('link', { name: 'Open details' }).click();\n  const page1 = await page1Promise;\n  await page1.getByRole('button', { name: 'Save' }).click();\n});\n";
  const analysis = analyzeRecording(recording);

  assert.equal(analysis.steps.length, 4);
  assert.match(analysis.steps[1].summary, /new browser tab/);
  assert.match(analysis.steps[3].summary, /In a new tab/);
  assert.match(analysis.steps[3].summary, /Save/);
});

test('places a reviewed wait after a captured action in the generated job', () => {
  const workflow = createWorkflow({ name: 'Timed report' });
  workflow.recordingFile = recordingFilename(workflow);
  fs.mkdirSync('automations', { recursive: true });
  fs.writeFileSync(path.resolve('automations', workflow.recordingFile), "import { test } from '@playwright/test';\n\ntest('timed report', async ({ page }) => {\n  await page.goto('https://example.com');\n  await page.getByRole('button', { name: 'Open report' }).click();\n});\n");

  workflow.waits = configureWait(workflow, { afterStepNumber: 1, milliseconds: 2000 });
  const generated = generateScript(workflow);
  assert.deepEqual(workflow.waits, [{ afterStepNumber: 1, milliseconds: 2000 }]);
  assert.match(generated.code, /Matchday wait: 2000 ms after captured step 1/);
  assert.match(generated.code, /await page\.waitForTimeout\(2000\);/);
  assert.equal(generated.rawSteps.length, 2);
  assert.equal(generated.steps.length, 3);
  assert.equal(applyConfiguredWaits("  await page.goto('https://example.com');", workflow.waits), "  await page.goto('https://example.com');\n  await page.waitForTimeout(2000);");
});

test('flags risky recorded actions and preserves repeated actions separated by useful work', () => {
  const code = "import { test } from '@playwright/test';\n\ntest('submit report', async ({ page }) => {\n  await page.goto('https://example.com/report');\n  await page.getByRole('button', { name: 'Save draft' }).click();\n  await page.goto('https://example.com/report');\n  await page.getByRole('button', { name: 'Submit report' }).click();\n});\n";
  const analysis = analyzeRecording(code);
  const optimized = optimizeRecording(code);

  assert.equal(analysis.riskySteps.length, 1);
  assert.match(analysis.riskySteps[0].summary, /Submit report/);
  assert.equal(analysis.steps.length, 4);
  assert.equal((optimized.code.match(/page\.goto\('https:\/\/example\.com\/report'\)/g) || []).length, 2);
  assert.match(optimized.optimizations[0], /exact recorded flow was preserved/);
});
