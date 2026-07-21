import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { assessRecordedReliability, redactSensitiveRecording, sanitizeTechnicalLog, validateRecordedTargets } from './security.js';

const safe = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workflow';
const automationPath = filename => path.resolve(process.env.ANUKRITI_JOB_AUTOMATION_DIR || 'automations', filename);
const automationConfig = path.resolve(import.meta.dirname, '..', 'playwright.automation.config.js');
const riskPattern = /\b(delete|remove|submit|send|purchase|pay|checkout|place order|transfer)\b/i;

const starterTemplates = [
  {
    key: 'fifa-world-cup-insights',
    name: 'FIFA World Cup news and scores insights',
    startUrl: 'https://www.bing.com/search?q=FIFA+World+Cup+news+and+scores',
    code: "import { test, expect } from '@playwright/test';\n\ntest('search FIFA World Cup news and scores insights', async ({ page }) => {\n  await page.goto('https://www.bing.com/search?q=FIFA+World+Cup+news+and+scores', { waitUntil: 'domcontentloaded' });\n  await expect(page).toHaveURL(/bing\\.com\\/search/);\n  await expect(page).toHaveTitle(/FIFA World Cup news and scores/i);\n});\n"
  },
  {
    key: 'stocks-technical-indicators',
    name: 'Stocks technical indicators research',
    startUrl: 'https://www.bing.com/search?q=stocks+technical+indicators',
    code: "import { test, expect } from '@playwright/test';\n\ntest('search stocks and technical indicators', async ({ page }) => {\n  await page.goto('https://www.bing.com/search?q=stocks+technical+indicators', { waitUntil: 'domcontentloaded' });\n  await expect(page).toHaveURL(/bing\\.com\\/search/);\n  await expect(page).toHaveTitle(/stocks technical indicators/i);\n});\n"
  },
  {
    key: 'flowood-house-prices',
    name: 'Flowood house price research',
    startUrl: 'https://www.bing.com/search?q=Flowood+MS+house+prices',
    code: "import { test, expect } from '@playwright/test';\n\ntest('search Flowood house prices', async ({ page }) => {\n  await page.goto('https://www.bing.com/search?q=Flowood+MS+house+prices', { waitUntil: 'domcontentloaded' });\n  await expect(page).toHaveURL(/bing\\.com\\/search/);\n  await expect(page).toHaveTitle(/Flowood MS house prices/i);\n});\n"
  },
  {
    key: 'shopping-best-deals',
    name: 'Best deals shopping research',
    startUrl: 'https://www.bing.com/search?q=best+deals+wireless+earbuds+Amazon+eBay',
    code: "import { test, expect } from '@playwright/test';\n\ntest('search best deals across Amazon and eBay', async ({ page }) => {\n  await page.goto('https://www.bing.com/search?q=best+deals+wireless+earbuds+Amazon+eBay', { waitUntil: 'domcontentloaded' });\n  await expect(page).toHaveURL(/bing\\.com\\/search/);\n  await expect(page).toHaveTitle(/best deals wireless earbuds Amazon eBay/i);\n});\n"
  }
];

const controlledDemoTemplates = [
  {
    key: 'anukriti-fifa-briefing', name: 'Demo: FIFA World Cup briefing', startPath: '/demo-websites/anukriti-fifa-briefing.html',
    code: "import { test, expect } from '@playwright/test';\n\ntest('build a FIFA World Cup briefing', async ({ page }) => {\n  await page.goto(process.env.ANUKRITI_CONTROLLED_DEMO_ORIGIN + '/demo-websites/anukriti-fifa-briefing.html');\n  await page.getByLabel('Briefing topic').fill('FIFA World Cup 2026');\n  await page.getByRole('button', { name: 'Build briefing' }).click();\n  await expect(page.getByRole('heading', { name: 'FIFA World Cup briefing ready' })).toBeVisible();\n});\n"
  },
  {
    key: 'anukriti-stock-snapshot', name: 'Demo: Stock technical snapshot', startPath: '/demo-websites/anukriti-stock-snapshot.html',
    code: "import { test, expect } from '@playwright/test';\n\ntest('create a stock technical snapshot', async ({ page }) => {\n  await page.goto(process.env.ANUKRITI_CONTROLLED_DEMO_ORIGIN + '/demo-websites/anukriti-stock-snapshot.html');\n  await page.getByLabel('Stock symbol').fill('AAPL');\n  await page.getByRole('button', { name: 'Create snapshot' }).click();\n  await expect(page.getByRole('heading', { name: 'AAPL technical snapshot' })).toBeVisible();\n});\n"
  },
  {
    key: 'anukriti-deals-compare', name: 'Demo: Best-deals comparison', startPath: '/demo-websites/anukriti-deals-compare.html',
    code: "import { test, expect } from '@playwright/test';\n\ntest('compare the best deals', async ({ page }) => {\n  await page.goto(process.env.ANUKRITI_CONTROLLED_DEMO_ORIGIN + '/demo-websites/anukriti-deals-compare.html');\n  await page.getByLabel('Item to compare').fill('wireless earbuds');\n  await page.getByLabel('Budget').selectOption('80');\n  await page.getByRole('button', { name: 'Compare deals' }).click();\n  await expect(page.getByRole('heading', { name: 'Comparison ready' })).toBeVisible();\n});\n"
  },
  {
    key: 'anukriti-standup-digest', name: 'Demo: Daily stand-up digest', startPath: '/demo-websites/anukriti-standup-digest.html',
    code: "import { test, expect } from '@playwright/test';\n\ntest('create a daily stand-up digest', async ({ page }) => {\n  await page.goto(process.env.ANUKRITI_CONTROLLED_DEMO_ORIGIN + '/demo-websites/anukriti-standup-digest.html');\n  await page.getByLabel('Today’s highlights').fill('Validated a reusable report job');\n  await page.getByRole('button', { name: 'Create digest' }).click();\n  await expect(page.getByRole('heading', { name: 'Daily stand-up digest ready' })).toBeVisible();\n});\n"
  },
  {
    key: 'anukriti-invoice-check', name: 'Demo: Invoice exception check', startPath: '/demo-websites/anukriti-invoice-check.html',
    code: "import { test, expect } from '@playwright/test';\n\ntest('check an invoice exception', async ({ page }) => {\n  await page.goto(process.env.ANUKRITI_CONTROLLED_DEMO_ORIGIN + '/demo-websites/anukriti-invoice-check.html');\n  await page.getByLabel('Invoice ID').fill('INV-2048');\n  await page.getByLabel('Amount band').selectOption('review');\n  await page.getByRole('button', { name: 'Check invoice' }).click();\n  await expect(page.getByRole('heading', { name: 'Invoice check ready' })).toBeVisible();\n});\n"
  }
];

const quoted = (value, fallback = 'this item') => value?.match(/['"]([^'"]+)['"]/)?.[1] || fallback;
const namedTarget = line => {
  const role = line.match(/getByRole\(['"]([^'"]+)['"].*?name:\s*['"]([^'"]+)['"]/);
  if (role) return `${role[1]} “${role[2]}”`;
  const label = line.match(/getByLabel\(['"]([^'"]+)['"]/);
  if (label) return `“${label[1]}”`;
  const text = line.match(/getByText\(['"]([^'"]+)['"]/);
  if (text) return `text “${text[1]}”`;
  const placeholder = line.match(/getByPlaceholder\(['"]([^'"]+)['"]/);
  if (placeholder) return `field “${placeholder[1]}”`;
  return 'the page';
};

const countFromLog = (log, label) => {
  const match = log.match(new RegExp(`\\b(\\d+)\\s+${label}\\b`, 'i'));
  return match ? Number(match[1]) : 0;
};

const runCounts = log => {
  const passed = countFromLog(log, 'passed');
  const failed = countFromLog(log, 'failed');
  const skipped = countFromLog(log, 'skipped');
  return { reported: /\b\d+\s+(?:passed|failed|skipped)\b/i.test(log), passed, failed, skipped };
};

const actionMentionedInLog = (workflow, log) => (workflow.optimizedSteps || workflow.steps || []).find(step => {
  const compact = String(step.code || '').replace(/\s+/g, ' ').replace(/^await\s+\w+\./, '').trim();
  return compact.length > 12 && log.replace(/\s+/g, ' ').includes(compact);
});

function failureIssue(workflow, log, { timedOut = false, error = '' } = {}) {
  const source = `${error}\n${log}`;
  const step = actionMentionedInLog(workflow, source);
  const atStep = step ? { number: step.number, summary: step.summary } : null;
  if (timedOut || /timed out after two minutes/i.test(source)) return { category: 'run timeout', message: 'The replay reached Chayya’s two-minute safety limit before it could finish.', recovery: 'Run visibly, inspect where the page is slow, then add a targeted wait or re-record the affected step.', step: atStep };
  if (/cloudflare|turnstile|recaptcha|hcaptcha|bot.verification/i.test(source)) return { category: 'bot verification', message: 'The site asked for a bot-verification step that Chayya will not automate.', recovery: 'Complete verification manually, stop at a public result page, or use a supported integration instead.', step: atStep };
  if (/locator\.|waiting for locator|strict mode violation/i.test(source)) return { category: 'page control changed', message: 'An expected page control was not available in the recorded form.', recovery: 'Run visibly, inspect the changed page, then re-record the affected named action.', step: atStep };
  if (/test timeout|timeout.*exceeded|timed out/i.test(source)) return { category: 'step timeout', message: 'A saved browser action did not finish before its timeout.', recovery: 'Run visibly and inspect the affected page. Add a targeted wait only if the action itself is still stable.', step: atStep };
  if (/navigation|page\.goto|net::|err_/i.test(source)) return { category: 'navigation', message: 'The browser could not reach or validate the expected page.', recovery: 'Check the site and connection, then rehearse this version visibly before retrying.', step: atStep };
  if (/expect\(|assertion|tohave/i.test(source)) return { category: 'saved check', message: 'The page opened, but the saved verification did not match what the job expected.', recovery: 'Run visibly, review the expected result, and re-record or update the job if the page changed.', step: atStep };
  if (/enoent|spawn|executable|npx/i.test(source)) return { category: 'runner setup', message: 'The local browser runner could not start correctly.', recovery: 'Check that Node, Playwright, and the installed browser are available, then retry the visible rehearsal.', step: atStep };
  return { category: 'replay stopped', message: 'The saved browser replay stopped before it could prove its expected result.', recovery: 'Run visibly, review the technical details, then re-record the affected action if the page changed.', step: atStep };
}

export function executionEvidence(workflow, { filename = workflow.script, code } = {}) {
  const script = path.basename(filename || '');
  const contents = code ?? (script && fs.existsSync(automationPath(script)) ? fs.readFileSync(automationPath(script), 'utf8') : '');
  if (!script || !contents) return null;
  return {
    workflowVersion: Number(workflow.version || 1),
    script,
    scriptFingerprint: crypto.createHash('sha256').update(contents).digest('hex').slice(0, 16),
    recordedStepCount: (workflow.recordedSteps || workflow.steps || []).length,
    runnableStepCount: (workflow.optimizedSteps || workflow.steps || []).length,
    configuredWaitCount: (workflow.waits || []).length
  };
}

export function hasVisiblePassForExecution(workflow, execution) {
  if (!execution?.scriptFingerprint) return false;
  const candidates = [workflow.lastRun, ...(workflow.runHistory || [])].filter(Boolean);
  return candidates.some(run => run.status === 'Passed' && run.runMode === 'visible' && run.execution?.workflowVersion === execution.workflowVersion && run.execution?.scriptFingerprint === execution.scriptFingerprint);
}

export function summarizePlaywrightRun(workflow, { status, runMode, output = '', error = '', timedOut = false, execution = null } = {}) {
  const technicalLog = sanitizeTechnicalLog(output || error);
  const counts = runCounts(technicalLog);
  const passed = status === 'Passed';
  const issue = passed ? null : failureIssue(workflow, technicalLog, { timedOut, error });
  const checkPhrase = counts.reported
    ? `${counts.passed} saved browser check${counts.passed === 1 ? '' : 's'} passed${counts.failed ? `; ${counts.failed} failed` : ''}.`
    : passed ? 'The Playwright process completed successfully.' : 'The saved browser check did not pass.';
  return {
    technicalLog,
    proof: {
      schemaVersion: 1,
      kind: 'browser_execution',
      verdict: passed ? 'passed' : 'failed',
      headline: passed ? 'Saved browser checks passed.' : 'This replay needs attention.',
      summary: passed
        ? `${checkPhrase} ${runMode === 'visible' ? 'The visible rehearsal is recorded for this exact saved version.' : 'This trusted background replay is recorded for this exact saved version.'}`
        : issue.message,
      boundary: passed
        ? 'This proves the saved Playwright checks passed. Verify any broader business outcome in the target page unless the job asserts it directly.'
        : 'Your prior saved capture and earlier run evidence are retained; this failed replay did not overwrite them.',
      testCounts: counts,
      issue,
      nextSafeAction: passed
        ? (runMode === 'visible' ? 'You can now use Background for this exact reviewed version, or rehearse visibly again.' : 'Review the saved proof or rehearse visibly again if the target page changes.')
        : issue.recovery,
      execution,
      parser: 'playwright-line-v1'
    }
  };
}

export function analyzeRecording(code) {
  const lines = code.split('\n').map(line => line.trim()).filter(Boolean);
  const steps = [];
  for (const line of lines) {
    const popup = line.match(/^const\s+\w+\s*=\s*page\.waitForEvent\(['"]popup['"]\)/);
    if (popup) {
      steps.push({ number: steps.length + 1, kind: 'popup', summary: 'Wait for a result to open in a new browser tab', code: line, requiresConfirmation: false });
      continue;
    }
    const pageAction = line.match(/^await\s+(page[\w$]*)\./);
    if (!pageAction) continue;
    const pageAlias = pageAction[1];
    let summary;
    let kind;
    if (line.includes('.goto(')) {
      kind = 'navigate'; summary = `Open ${quoted(line.match(/\.goto\((.*)\)/)?.[1], 'the starting page')}`;
    } else if (line.includes('.fill(')) {
      kind = 'fill'; summary = `Enter information in ${namedTarget(line)}`;
    } else if (line.includes('.check(')) {
      kind = 'check'; summary = `Select ${namedTarget(line)}`;
    } else if (line.includes('.selectOption(')) {
      kind = 'select'; summary = `Choose an option in ${namedTarget(line)}`;
    } else if (line.includes('.click(')) {
      kind = 'click'; summary = `Click ${namedTarget(line)}`;
    } else if (line.includes('.waitForTimeout(')) {
      kind = 'wait'; summary = 'Wait for the page to finish an action';
    } else {
      kind = 'action'; summary = 'Perform a browser action';
    }
    if (pageAlias !== 'page') summary = `In a new tab, ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`;
    steps.push({ number: steps.length + 1, kind, summary, code: line, requiresConfirmation: riskPattern.test(line) || riskPattern.test(summary) });
  }
  return { steps, riskySteps: steps.filter(step => step.requiresConfirmation) };
}

function capturedFillValue(line) {
  const match = line.match(/\.fill\(\s*(['"])((?:\\.|(?!\1).)*)\1\s*\)/);
  return match?.[2]?.replace(/\\(['"\\])/g, '$1').trim() || '';
}

export function optimizeRecording(code) {
  const lines = code.split('\n');
  const optimizedLines = [];
  const optimizations = [];
  let previousAction = '';
  for (const line of lines) {
    const action = line.trim();
    const removable = action.startsWith('await page.') && (action.includes('.goto(') || action.includes('.fill('));
    if (removable && action === previousAction) {
      const analysis = analyzeRecording(action);
      optimizations.push(`Removed repeated ${analysis.steps[0]?.summary?.toLowerCase() || 'browser action'}.`);
      continue;
    }
    optimizedLines.push(line);
    previousAction = removable ? action : '';
  }
  const optimizedCode = optimizedLines.join('\n');
  const analysis = analyzeRecording(optimizedCode);
  if (!optimizations.length) optimizations.push('No provably redundant consecutive actions were found; the exact recorded flow was preserved.');
  return { code: optimizedCode, optimizations, steps: analysis.steps, riskySteps: analysis.riskySteps };
}

export function configureWait(workflow, input, recordingOverride = null) {
  const afterStepNumber = Number(input?.afterStepNumber); const milliseconds = Number(input?.milliseconds);
  const recording = recordingOverride || getRecording(workflow);
  if (!recording.ready) {
    const error = new Error('Finish the browser recording before adding a wait.'); error.status = 409; throw error;
  }
  const step = recording.steps.find(item => item.number === afterStepNumber);
  if (!step || step.kind === 'popup' || step.kind === 'wait') {
    const error = new Error('Choose a captured browser action to place a wait after.'); error.status = 400; throw error;
  }
  if (milliseconds === 0) return (workflow.waits || []).filter(item => item.afterStepNumber !== afterStepNumber);
  if (!Number.isInteger(milliseconds) || milliseconds < 500 || milliseconds > 10000 || milliseconds % 500 !== 0) {
    const error = new Error('Choose a wait from 0.5 to 10 seconds in half-second increments.'); error.status = 400; throw error;
  }
  const waits = (workflow.waits || []).filter(item => item.afterStepNumber !== afterStepNumber);
  waits.push({ afterStepNumber, milliseconds }); waits.sort((left, right) => left.afterStepNumber - right.afterStepNumber);
  return waits;
}

export function applyConfiguredWaits(code, waits = []) {
  if (!waits.length) return code;
  const configured = new Map(waits.map(item => [item.afterStepNumber, item.milliseconds]));
  const stepNumbersByCode = new Map();
  for (const step of analyzeRecording(code).steps) {
    const values = stepNumbersByCode.get(step.code) || []; values.push(step.number); stepNumbersByCode.set(step.code, values);
  }
  const output = [];
  for (const line of code.split('\n')) {
    output.push(line);
    const trimmed = line.trim(); const numbers = stepNumbersByCode.get(trimmed); const stepNumber = numbers?.shift();
    const page = trimmed.match(/^await\s+(page[\w$]*)\./)?.[1]; const milliseconds = configured.get(stepNumber);
    if (page && milliseconds) output.push(`${line.match(/^\s*/)?.[0] || ''}await ${page}.waitForTimeout(${milliseconds});`);
  }
  return output.join('\n');
}

const workflowKey = workflow => workflow.id ? workflow.id.slice(0, 8) : safe(workflow.name);
export const recordingFilename = workflow => `${safe(workflow.name)}-${workflowKey(workflow)}-capture-${(workflow.captureVersion || 0) + 1}.recording.spec.js`;
const scriptFilename = workflow => `${safe(workflow.name)}-${workflowKey(workflow)}-v${(workflow.version || 1) + 1}.spec.js`;
export const sopFilename = workflow => `${safe(workflow.name)}-${workflowKey(workflow)}-capture-${workflow.captureVersion || 1}.sop.md`;

const sopRuleFor = step => {
  if (step.requiresConfirmation) return 'Stop for explicit human confirmation before this consequential action. Do not submit, send, purchase, delete, transfer, or pay without that approval.';
  if (step.kind === 'navigate') return 'Open only the captured destination. If the route, account, or page context differs, stop and review the job before continuing.';
  if (step.kind === 'fill') return 'Enter only approved business data. Never record passwords, tokens, card data, or other secrets in this procedure.';
  if (step.kind === 'select' || step.kind === 'check') return 'Choose the captured named option or control. If its label or available choices differ, stop and re-record the affected step.';
  if (step.kind === 'popup') return 'Wait for the expected new tab, then continue only in that tab. Do not substitute an unrelated browser window.';
  if (step.kind === 'wait') return 'Wait only for the recorded page transition; a wait is not proof that the desired business outcome occurred.';
  return 'Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.';
};

const sopMarkdown = sop => {
  const rows = sop.steps.map(step => [`### Step ${String(step.number).padStart(2, '0')} — ${step.kind}`, `**Captured action:** ${step.action}`, `**Operating rule:** ${step.rule}`, step.waitAfter ? `**Required wait:** Wait ${step.waitAfter.milliseconds / 1000} seconds after this action before the next captured step.` : '', step.requiresConfirmation ? '**Approval checkpoint:** Explicit human confirmation is required before this action.' : '', '**Captured evidence:**', '```playwright', step.code, '```'].filter(Boolean).join('\n\n')).join('\n\n');
  const reviewRules = sop.reviewRules.length ? sop.reviewRules.map(rule => `- ${rule}`).join('\n') : '- No additional business rules have been added. The exact capture remains the source of truth.';
  const optimization = sop.optimization.length ? sop.optimization.map(note => `- ${note}`).join('\n') : '- The runnable-plan optimization has not been prepared yet. This SOP documents the exact capture.';
  return [
    `# ${sop.title}`,
    '',
    `**Rule book revision:** ${sop.revision}  `,
    `**Capture version:** ${sop.captureVersion}  `,
    `**Generated:** ${sop.updatedAt}  `,
    `**Recorded steps:** ${sop.steps.length}  `,
    `**Replay readiness:** ${sop.reliability.ok ? 'Capture reviewed for known selector risks; a visible rehearsal is still required before background use.' : 'Not replay-ready. Resolve the reliability findings below before preparing a reusable job.'}`,
    '',
    '## Purpose and scope',
    sop.purpose,
    '',
    'This SOP is derived from the exact saved browser capture. It documents what was observed; it does not invent business logic, credentials, or unrecorded actions.',
    '',
    '## Captured procedure',
    rows,
    '',
    '## Saved business and review rules',
    reviewRules,
    '',
    '## Optimization record',
    optimization,
    '',
    '## Reliability findings',
    sop.reliability.ok ? '- No known unstable selector pattern was detected in this capture.' : sop.reliability.issues.map(issue => `- **${issue.code}:** ${issue.message} Fix: ${issue.fix}`).join('\n'),
    '',
    '## Mandatory safeguards',
    ...sop.safeguards.map(item => `- ${item}`),
    '',
    '## Change control',
    'Re-record when the target page, named controls, or business process changes. Adding a wait or review note creates a new rule-book revision. Run visibly after any recording or code change before enabling a background replay.',
    ''
  ].join('\n');
};

export function buildSopRuleBook(workflow, now = new Date().toISOString()) {
  const recordedSteps = workflow.recordedSteps?.length ? workflow.recordedSteps : workflow.steps?.length ? workflow.steps : getRecording(workflow).steps;
  if (!recordedSteps.length) {
    const error = new Error('A completed recording is required before Chayya can create its SOP and Rule Book.');
    error.status = 409;
    throw error;
  }
  const waits = new Map((workflow.waits || []).map(wait => [wait.afterStepNumber, wait]));
  const reliability = workflow.recordingReliability || getRecording(workflow).reliability;
  return {
    schemaVersion: 1,
    revision: Number(workflow.sop?.revision || 0) + 1,
    title: `${workflow.name} — SOP & Rule Book`,
    filename: sopFilename(workflow),
    captureVersion: workflow.captureVersion || 1,
    createdAt: workflow.sop?.createdAt || now,
    updatedAt: now,
    purpose: `Repeat “${workflow.name}” using ${recordedSteps.length} observed browser action${recordedSteps.length === 1 ? '' : 's'} while preserving the exact capture and its review checkpoints.`,
    source: { startUrl: workflow.startUrl || null, recordingFile: workflow.recordingFile || null },
    reliability,
    reviewRules: [...(workflow.rules || [])],
    optimization: [...(workflow.optimization || [])],
    steps: recordedSteps.map(step => ({
      number: step.number,
      kind: step.kind,
      action: step.summary,
      rule: sopRuleFor(step),
      code: step.code,
      requiresConfirmation: Boolean(step.requiresConfirmation),
      waitAfter: waits.get(step.number) || null
    })),
    safeguards: [
      'Use the owner-approved account and data only. The recorded page state is not a substitute for an authorization check.',
      'Sensitive values recognised in the capture are redacted before this rule book is created; provide them only through the secure runtime when needed.',
      'Never automate bot verification, CAPTCHA, or an unexpected authentication challenge. Complete it manually or stop the run.',
      'If a named target, page, or result differs from this record, stop the replay and re-record the affected step rather than selecting by position or guesswork.'
    ]
  };
}

export function writeSopRuleBook(workflow, now = new Date().toISOString()) {
  const sop = buildSopRuleBook(workflow, now);
  const destination = automationPath(sop.filename);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, sopMarkdown(sop));
  return sop;
}

export const createWorkflow = ({ name, startUrl, platform = 'browser' }, ownerId) => ({
  id: crypto.randomUUID(), name: name || 'Untitled workflow', startUrl: startUrl || '', platform,
  steps: [], recordedSteps: [], optimizedSteps: [], riskySteps: [], waits: [], optimization: [], rules: [], sop: null, schedule: 'On demand', status: 'Draft', recordingFile: null, pendingRecordingFile: null, script: null,
  ownerId, version: 1, runHistory: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
});

export function createStarterWorkflows(db, ownerId) {
  const created = [];
  for (const template of starterTemplates) {
    if (db.workflows.some(workflow => workflow.ownerId === ownerId && workflow.starterKey === template.key)) continue;
    const workflow = createWorkflow({ name: template.name, startUrl: template.startUrl }, ownerId);
    workflow.starterKey = template.key;
    workflow.source = 'Verified starter template';
    workflow.recordingFile = recordingFilename(workflow);
    workflow.captureVersion = 1;
    fs.mkdirSync(path.dirname(automationPath(workflow.recordingFile)), { recursive: true });
    fs.writeFileSync(automationPath(workflow.recordingFile), template.code);
    const generated = generateScript(workflow);
    workflow.status = 'Ready to run'; workflow.script = generated.filename; workflow.version = 2; workflow.execution = generated.execution;
    workflow.steps = generated.rawSteps; workflow.recordedSteps = generated.rawSteps; workflow.optimizedSteps = generated.steps; workflow.riskySteps = generated.riskySteps; workflow.optimization = generated.optimization; workflow.recordingReliability = generated.reliability; workflow.sop = writeSopRuleBook(workflow);
    workflow.optimizedAt = new Date().toISOString(); workflow.updatedAt = workflow.optimizedAt;
    db.workflows.unshift(workflow); created.push(workflow);
  }
  return created;
}

export function createControlledDemoWorkflows(db, ownerId, controlledDemoOrigin) {
  const created = [];
  for (const template of controlledDemoTemplates) {
    if (db.workflows.some(workflow => workflow.ownerId === ownerId && workflow.controlledDemoKey === template.key)) continue;
    const workflow = createWorkflow({ name: template.name, startUrl: `${controlledDemoOrigin}${template.startPath}` }, ownerId);
    workflow.controlledDemoKey = template.key; workflow.controlledDemo = true;
    workflow.source = 'Controlled local demo — re-record this stable page or run its verified job';
    workflow.recordingFile = recordingFilename(workflow); workflow.captureVersion = 1;
    fs.mkdirSync(path.dirname(automationPath(workflow.recordingFile)), { recursive: true });
    fs.writeFileSync(automationPath(workflow.recordingFile), template.code);
    const generated = generateScript(workflow, { trustedLocalDemoOrigin: controlledDemoOrigin });
    workflow.status = 'Ready to run'; workflow.script = generated.filename; workflow.version = 2; workflow.execution = generated.execution;
    workflow.steps = generated.rawSteps; workflow.recordedSteps = generated.rawSteps; workflow.optimizedSteps = generated.steps; workflow.riskySteps = generated.riskySteps; workflow.optimization = generated.optimization; workflow.recordingReliability = generated.reliability; workflow.sop = writeSopRuleBook(workflow);
    workflow.optimizedAt = new Date().toISOString(); workflow.updatedAt = workflow.optimizedAt;
    db.workflows.unshift(workflow); created.push(workflow);
  }
  return created;
}

export function parseFeedback(text, workflow) {
  const rules = [...workflow.rules]; const added = [];
  if (/ask before|confirm before/i.test(text)) { rules.push('Ask for confirmation before a submit, send, purchase, or delete action.'); added.push('confirmation checkpoint'); }
  if (/skip|exclude|ignore/i.test(text)) { rules.push(`Filter rule: ${text}`); added.push('filter rule'); }
  if (/every (day|monday|tuesday|wednesday|thursday|friday|week|month)|schedule/i.test(text)) { workflow.schedule = text; added.push(`schedule: ${text}`); }
  if (!added.length) { rules.push(text); added.push('custom process rule'); }
  return [{ ...workflow, rules: [...new Set(rules)], updatedAt: new Date().toISOString(), status: workflow.status }, added];
}

export function getRecording(workflow, { persistRedaction = true } = {}) {
  const filename = workflow.recordingFile || recordingFilename(workflow);
  const target = automationPath(filename);
  if (!fs.existsSync(target)) return { ready: false, filename, code: null, steps: [], riskySteps: [], reliability: { ok: false, issues: [], summary: 'No completed recording is available yet.' } };
  let code = fs.readFileSync(target, 'utf8');
  const redacted = redactSensitiveRecording(code);
  if (redacted.code !== code) {
    code = redacted.code;
    if (persistRedaction) fs.writeFileSync(target, code);
  }
  const ready = code.includes('test(') && code.includes('page.');
  const analysis = ready ? analyzeRecording(code) : { steps: [], riskySteps: [] };
  return { ready, filename, code: ready ? code : null, redactedSecrets: redacted.redacted, reliability: ready ? assessRecordedReliability(code) : { ok: false, issues: [], summary: 'The recording is incomplete.' }, ...analysis };
}

export function generateScript(workflow, { trustedLocalDemoOrigin } = {}) {
  const recording = getRecording(workflow);
  if (!recording.ready) {
    const error = new Error('No saved recording yet. Start the recorder, complete the job, and close the recorder browser before preparing code.');
    error.status = 409;
    throw error;
  }
  const codeWithWaits = applyConfiguredWaits(recording.code, workflow.waits || []);
  const safeTargets = validateRecordedTargets(codeWithWaits, { trustedLocalDemoOrigin });
  if (safeTargets.error) {
    const error = new Error(safeTargets.error);
    error.status = 400;
    throw error;
  }
  const reliability = assessRecordedReliability(codeWithWaits);
  if (!reliability.ok) {
    const error = new Error(`${reliability.summary} ${reliability.issues.map(issue => issue.fix).join(' ')}`);
    error.status = 400;
    throw error;
  }
  const filename = scriptFilename(workflow);
  const destination = automationPath(filename);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const optimized = optimizeRecording(codeWithWaits);
  const rules = workflow.rules.map(rule => `// Review note: ${rule}`).join('\n');
  const notes = optimized.optimizations.map(note => `// Optimization: ${note}`).join('\n');
  const waitNotes = (workflow.waits || []).map(wait => `// Matchday wait: ${wait.milliseconds} ms after captured step ${wait.afterStepNumber}.`).join('\n');
  const header = `// Recorded by Chayya. Raw capture is retained in ${recording.filename}.\n${notes}\n${waitNotes}${waitNotes ? '\n' : ''}${rules}${rules ? '\n' : ''}`;
  fs.writeFileSync(destination, `${header}${optimized.code}`);
  const runnableCode = fs.readFileSync(destination, 'utf8');
  const execution = executionEvidence({ ...workflow, version: (workflow.version || 0) + 1, recordedSteps: recording.steps, optimizedSteps: optimized.steps }, { filename, code: runnableCode });
  return { filename, path: destination, url: `/automations/${filename}`, code: runnableCode, optimization: optimized.optimizations, rawSteps: recording.steps, steps: optimized.steps, riskySteps: optimized.riskySteps, reliability, execution };
}

export function prepareScriptRun(workflow, options = {}) {
  const runMode = options.runMode === 'visible' ? 'visible' : 'background';
  const filename = path.basename(workflow.script || '');
  const target = automationPath(filename);
  if (!filename || !fs.existsSync(target)) {
    const error = new Error('Prepare code from a saved recording before running this job.');
    error.status = 409;
    throw error;
  }
  const code = fs.readFileSync(target, 'utf8');
  const safeTargets = validateRecordedTargets(code, { trustedLocalDemoOrigin: options.trustedLocalDemoOrigin });
  if (safeTargets.error) {
    const error = new Error(safeTargets.error);
    error.status = 400;
    throw error;
  }
  const execution = executionEvidence(workflow, { filename, code });
  return { runMode, filename, target, code, execution };
}

export function runScript(workflow, options = {}, onComplete = () => {}) {
  // Keep the former two-argument call shape working for internal callers.
  if (typeof options === 'function') { onComplete = options; options = {}; }
  const prepared = options.preparedRun || prepareScriptRun(workflow, options);
  const { runMode, filename, target, execution } = prepared;
  const startedAt = Date.now();
  const child = spawn('npx', ['playwright', 'test', '--config', automationConfig, '--reporter=line'], {
    stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32',
    env: {
      ...process.env,
      ANUKRITI_AUTOMATION_DIR: path.dirname(target),
      ANUKRITI_TEST_FILE: filename,
      ANUKRITI_RUN_MODE: runMode,
      ...(options.trustedLocalDemoOrigin ? { ANUKRITI_CONTROLLED_DEMO_ORIGIN: options.trustedLocalDemoOrigin } : {})
    }
  });
  let output = '';
  const capture = chunk => { output = `${output}${chunk}`.slice(-6000); };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  let settled = false;
  const complete = outcome => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    onComplete({ ...outcome, output, durationMs: Date.now() - startedAt, execution });
  };
  child.once('error', error => complete({ error: error.message }));
  child.once('close', exitCode => complete({ exitCode }));
  const timeout = setTimeout(() => {
    capture(Buffer.from('Job timed out after two minutes.'));
    child.kill('SIGTERM');
    complete({ exitCode: 1, error: 'Job timed out after two minutes.', timedOut: true });
  }, 120000);
  return {
    runMode,
    execution,
    message: runMode === 'visible'
      ? 'A visible browser window is opening on this computer. Chayya will show the result when it finishes.'
      : 'Saved code is running in the background. Chayya will show the result when it finishes.'
  };
}

export function launchRecorder(workflow, onComplete = () => {}) {
  const captureVersion = (workflow.captureVersion || 0) + 1;
  const filename = recordingFilename(workflow);
  const pendingFilename = `${filename}.${crypto.randomUUID()}.partial`;
  const destination = automationPath(pendingFilename);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const args = ['playwright', 'codegen', '--target=playwright-test', '--output', destination];
  if (workflow.startUrl) args.push(workflow.startUrl);
  const child = spawn('npx', args, { detached: true, stdio: 'ignore', shell: process.platform === 'win32' });
  let settled = false;
  const complete = outcome => {
    if (settled) return;
    settled = true;
    // Codegen still owns this temporary file until its process exits. Inspect
    // it without writing redactions back so polling can never race codegen.
    const partial = getRecording({ ...workflow, recordingFile: pendingFilename }, { persistRedaction: false });
    if (partial.ready) {
      fs.renameSync(destination, automationPath(filename));
      onComplete({ filename, pendingFilename, captureVersion, ...outcome, recording: getRecording({ ...workflow, recordingFile: filename }) });
    } else {
      fs.rmSync(destination, { force: true });
      onComplete({ filename, pendingFilename, captureVersion, ...outcome, recording: partial });
    }
  };
  child.once('error', error => complete({ error: error.message }));
  child.once('close', code => complete({ exitCode: code }));
  child.unref();
  return { filename, pendingFilename, captureVersion, message: 'Recorder opened. Complete the job in that browser, then close it. Chayya will save the complete Playwright code after the recorder closes.' };
}
