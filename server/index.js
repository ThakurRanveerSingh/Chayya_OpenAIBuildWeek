import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { authenticate, createSession, hasRole, publicUser, registerUser, revokeSession, sessionUser, validRole } from './auth.js';
import { getTransactions, validate, writeWorkbook } from './posable.js';
import { audit, readStore, record, writeStore } from './store.js';
import { addFocusBlock, addWorkdayEvent, clearWorkdayForOwner, endWorkday, startWorkday, workdayForOwner, workdayResponse } from './workday.js';
import { sanitizeTechnicalLog, validateAutomationUrl } from './security.js';
import { configureWait, createControlledDemoWorkflows, createStarterWorkflows, createWorkflow, executionEvidence, generateScript, getRecording, hasVisiblePassForExecution, launchRecorder, parseFeedback, prepareScriptRun, runScript, summarizePlaywrightRun, writeSopRuleBook } from './workflows.js';
import { inspectActiveNumbersTable, inspectNumbersResearchInput, numbersStatus, writeNumbersResearchResults } from './mac-numbers.js';
import { createNumbersResearchJob, loadControlledResearchResults, numbersResearchJobForUser, prepareNumbersResearchProposal, saveManualResearchResult, visibleNumbersResearchJobs, writeApprovedNumbersResearch } from './numbers-research.js';
import { approvedWorkbookPath, backofficeSummary, loadBackofficeQueue, optimizeBackofficeProcess, processJobForUser, proofReport, recordBackofficeProcess, runBackofficeDemo } from './backoffice.js';
import { createResumeJob, exportResumeReview, extractResumeText, listResumeJobs, resumeExportPath, resumeJobForUser, resumeJobResponse, resumeProof } from './resume.js';

const app = express();
const port = process.env.PORT || 3001;
const controlledDemoOrigin = `http://127.0.0.1:${port}`;
const requestCounts = new Map();
const apiMetrics = { startedAt: Date.now(), requests: 0, responses: new Map(), runs: new Map() };
const resumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });

function routeLabel(req) {
  if (req.path.startsWith('/api/workflows')) return '/api/workflows';
  if (req.path.startsWith('/api/auth')) return '/api/auth';
  return req.path;
}
function increment(map, key) { map.set(key, (map.get(key) || 0) + 1); }
function prometheusMetrics() {
  const responseLines = [...apiMetrics.responses.entries()].map(([key, value]) => {
    const [method, path, status] = key.split('|');
    return `anukriti_http_responses_total{method="${method}",path="${path}",status="${status}"} ${value}`;
  });
  const runLines = [...apiMetrics.runs.entries()].map(([status, value]) => `anukriti_job_runs_total{status="${status}"} ${value}`);
  return ['# HELP anukriti_http_requests_total Total HTTP requests received.', '# TYPE anukriti_http_requests_total counter', `anukriti_http_requests_total ${apiMetrics.requests}`, '# HELP anukriti_http_responses_total HTTP responses by route and status.', '# TYPE anukriti_http_responses_total counter', ...responseLines, '# HELP anukriti_job_runs_total Completed browser jobs by status.', '# TYPE anukriti_job_runs_total counter', ...runLines, '# HELP anukriti_process_uptime_seconds Process uptime in seconds.', '# TYPE anukriti_process_uptime_seconds gauge', `anukriti_process_uptime_seconds ${Math.floor((Date.now() - apiMetrics.startedAt) / 1000)}`, ''].join('\n');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' });
  next();
});
app.use((req, res, next) => {
  const key = req.ip || 'unknown'; const now = Date.now(); const entry = requestCounts.get(key) || { startedAt: now, count: 0 };
  if (now - entry.startedAt > 60_000) { entry.startedAt = now; entry.count = 0; }
  entry.count += 1; requestCounts.set(key, entry);
  if (entry.count > 120) return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  next();
});
app.use((req, res, next) => {
  const startedAt = Date.now();
  apiMetrics.requests += 1;
  res.on('finish', () => {
    increment(apiMetrics.responses, `${req.method}|${routeLabel(req)}|${res.statusCode}`);
    console.info(JSON.stringify({ event: 'api_request', method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt }));
  });
  next();
});

function requireAuth(req, res, next) {
  const user = sessionUser(readStore(), req.get('authorization'));
  if (!user) return res.status(401).json({ error: 'Sign in to use Chayya.' });
  req.user = user;
  next();
}
function requireRole(...allowed) {
  return (req, res, next) => hasRole(req.user, ...allowed) ? next() : res.status(403).json({ error: 'Your role does not have permission for this action.' });
}
function workflowForUser(db, id, user) {
  const workflow = db.workflows.find(item => item.id === id);
  if (!workflow) return { error: [404, 'Workflow not found'] };
  if (workflow.ownerId !== user.id && user.role !== 'admin') return { error: [403, 'You do not have access to this job.'] };
  return { workflow };
}
function visibleWorkflows(db, user) { return db.workflows.filter(item => item.ownerId === user.id || user.role === 'admin'); }
function runResponse(run, { includeTechnicalLog = false } = {}) {
  if (!run) return null;
  const { output, technicalLog, ...result } = run;
  if (includeTechnicalLog) result.technicalLog = technicalLog || sanitizeTechnicalLog(output || '');
  return result;
}
function workflowResponse(workflow, { includeTechnicalLog = false } = {}) {
  const { lastRun, runHistory, ...result } = workflow;
  // Older saved jobs predate execution fingerprints. Expose the current
  // fingerprint where possible, but require a fresh visible rehearsal before
  // allowing their background mode.
  const execution = workflow.execution || executionEvidence(workflow);
  return { ...result, execution, lastRun: runResponse(lastRun, { includeTechnicalLog }), runHistory: (runHistory || []).map(run => runResponse(run, { includeTechnicalLog })) };
}
function auditAndSave(db, user, action, resourceType, resourceId, metadata = {}) { audit(db, user, action, resourceType, resourceId, metadata); writeStore(db); }
function backfillSopRuleBooks(db) {
  let changed = false;
  for (const workflow of db.workflows || []) {
    if (!workflow.sop && workflow.recordingFile) {
      try { workflow.sop = writeSopRuleBook(workflow); changed = true; } catch { /* A legacy incomplete capture remains available without an SOP. */ }
    }
  }
  if (changed) writeStore(db);
}

function startBackofficeWorker(db, user, queue, processJob = null) {
  const state = db.backoffice || {}; const startedAt = new Date().toISOString();
  const job = { id: crypto.randomUUID(), ownerId: user.id, queueBatchId: queue.id, processJobId: processJob?.id || null, status: 'Running', startedAt, events: [{ at: startedAt, stage: 'Queued records accepted', detail: `${queue.source.recordCount} records are ready for background routing.` }] };
  state.jobs ||= []; state.jobs.unshift(job); state.jobs = state.jobs.slice(0, 30); queue.status = 'Processing'; queue.startedAt = startedAt;
  if (processJob) {
    processJob.status = 'Running';
    processJob.lastExecution = { id: crypto.randomUUID(), status: 'Running', startedAt, jobId: job.id, queueBatchId: queue.id, processVersion: processJob.version };
    processJob.executionHistory ||= []; processJob.executionHistory.unshift(processJob.lastExecution); processJob.executionHistory = processJob.executionHistory.slice(0, 30);
    audit(db, user, 'backoffice.process_execution_started', 'backoffice_process_job', processJob.id, { jobId: job.id, queueBatchId: queue.id, processVersion: processJob.version, sourceFingerprint: queue.source.fingerprint });
  }
  db.backoffice = state;
  audit(db, user, 'backoffice.background_started', 'backoffice_job', job.id, { queueBatchId: queue.id, processJobId: processJob?.id || null, sourceCount: queue.source.recordCount });
  writeStore(db);
  setTimeout(async () => {
    const next = readStore(); const nextState = next.backoffice || {}; const currentJob = (nextState.jobs || []).find(item => item.id === job.id); const currentQueue = (nextState.queueBatches || []).find(item => item.id === queue.id); const currentProcess = job.processJobId ? (nextState.processJobs || []).find(item => item.id === job.processJobId) : null;
    if (!currentJob || !currentQueue || currentJob.status !== 'Running') return;
    try {
      const run = await runBackofficeDemo(next, user.id, { invoices: currentQueue.records, queueBatchId: currentQueue.id, jobId: currentJob.id, processJobId: job.processJobId, startedAt });
      currentJob.status = 'Completed'; currentJob.completedAt = run.completedAt; currentJob.durationMs = run.durationMs; currentJob.runId = run.id;
      currentJob.events.push(...run.proof.events.map(detail => ({ at: run.completedAt, stage: 'Proof', detail })));
      currentQueue.status = 'Processed'; currentQueue.completedAt = run.completedAt; currentQueue.runId = run.id;
      if (currentProcess) {
        currentProcess.status = 'Ready to run';
        const execution = currentProcess.executionHistory?.find(item => item.jobId === currentJob.id);
        if (execution) Object.assign(execution, { status: 'Completed', completedAt: run.completedAt, durationMs: run.durationMs, runId: run.id, analytics: run.analytics });
        currentProcess.lastExecution = execution || { status: 'Completed', completedAt: run.completedAt, runId: run.id, analytics: run.analytics };
        audit(next, user, 'backoffice.process_execution_completed', 'backoffice_process_job', currentProcess.id, { jobId: currentJob.id, queueBatchId: currentQueue.id, runId: run.id, passed: run.analytics.passed, failed: run.analytics.failed, durationMs: run.durationMs });
      }
      audit(next, user, 'backoffice.background_completed', 'backoffice_job', currentJob.id, { runId: run.id, passed: run.analytics.passed, failed: run.analytics.failed, durationMs: run.durationMs }); writeStore(next);
    } catch (error) {
      currentJob.status = 'Failed'; currentJob.completedAt = new Date().toISOString(); currentJob.error = error.message; currentQueue.status = 'Queued';
      if (currentProcess) {
        currentProcess.status = 'Ready to run';
        const execution = currentProcess.executionHistory?.find(item => item.jobId === currentJob.id);
        if (execution) Object.assign(execution, { status: 'Failed', completedAt: currentJob.completedAt, error: error.message });
        currentProcess.lastExecution = execution || { status: 'Failed', completedAt: currentJob.completedAt, error: error.message };
        audit(next, user, 'backoffice.process_execution_failed', 'backoffice_process_job', currentProcess.id, { jobId: currentJob.id, queueBatchId: currentQueue.id, error: error.message });
      }
      audit(next, user, 'backoffice.background_failed', 'backoffice_job', currentJob.id, { error: error.message }); writeStore(next);
    }
  }, 100);
  return job;
}

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'anukriti-api', time: new Date().toISOString() }));
app.get('/api/ready', (_, res) => {
  try { readStore(); res.json({ status: 'ready', storage: 'available' }); }
  catch { res.status(503).json({ status: 'not ready', storage: 'unavailable' }); }
});
app.get('/metrics', (_, res) => res.type('text/plain; version=0.0.4').send(prometheusMetrics()));
app.post('/api/auth/register', (req, res) => {
  const db = readStore(); const result = registerUser(db, req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  const session = createSession(result.user); auditAndSave(db, result.user, 'account.created', 'user', result.user.id);
  res.status(201).json({ user: publicUser(result.user), ...session });
});
app.post('/api/auth/login', (req, res) => {
  const db = readStore(); const user = authenticate(db, req.body?.email, req.body?.password);
  if (!user) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const session = createSession(user); auditAndSave(db, user, 'session.created', 'session', user.id);
  res.json({ user: publicUser(user), ...session });
});
app.post('/api/auth/logout', requireAuth, (req, res) => {
  revokeSession(req.get('authorization')?.slice(7));
  const db = readStore(); auditAndSave(db, req.user, 'session.revoked', 'session', req.user.id);
  res.status(204).end();
});
app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.use('/api', requireAuth);
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

app.get('/api/state', (req, res) => {
  const db = readStore();
  res.json({ workflows: visibleWorkflows(db, req.user), history: db.history.filter(item => item.actorId === req.user.id) });
});
app.get('/api/workday/today', (req, res) => {
  const workday = workdayForOwner(readStore(), req.user.id);
  res.json({ workday: workdayResponse(workday) });
});
app.post('/api/workday/start', (req, res) => {
  const db = readStore();
  try {
    const workday = startWorkday(db, req.user.id, req.body || {});
    auditAndSave(db, req.user, 'workday.started', 'workday', workday.id, { date: workday.date });
    res.status(201).json({ workday: workdayResponse(workday) });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.post('/api/workday/focus', (req, res) => {
  const db = readStore(); const workday = workdayForOwner(db, req.user.id);
  try {
    const block = addFocusBlock(workday, req.body || {});
    auditAndSave(db, req.user, 'workday.focus_logged', 'workday', workday.id, { minutes: block.minutes });
    res.status(201).json({ workday: workdayResponse(workday) });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.post('/api/workday/end', (req, res) => {
  const db = readStore(); const workday = workdayForOwner(db, req.user.id);
  try {
    endWorkday(workday, req.body || {});
    auditAndSave(db, req.user, 'workday.closed', 'workday', workday.id, { date: workday.date, focusMinutes: workdayResponse(workday).summary.focusMinutes });
    res.json({ workday: workdayResponse(workday) });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.delete('/api/workday/today', (req, res) => {
  const db = readStore();
  try {
    const workday = clearWorkdayForOwner(db, req.user.id);
    auditAndSave(db, req.user, 'workday.cleared', 'workday', workday.id, { date: workday.date, focusMinutes: workdayResponse(workday).summary.focusMinutes, status: workday.status });
    res.json({ workday: null });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.get('/api/mac/numbers/status', (_, res) => res.json(numbersStatus()));
app.post('/api/mac/numbers/inspect', requireRole('admin', 'creator'), async (req, res) => {
  try {
    const inspection = await inspectActiveNumbersTable();
    const db = readStore();
    auditAndSave(db, req.user, 'numbers.active_table_inspected', 'numbers_table', `${inspection.table.documentName}/${inspection.table.sheetName}/${inspection.table.tableName}`, { rows: inspection.table.rowCount, columns: inspection.table.columnCount, numericColumns: inspection.summary.numericColumns.length });
    res.json(inspection);
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/mac/numbers/research/jobs', (req, res) => res.json(visibleNumbersResearchJobs(readStore(), req.user)));
app.post('/api/mac/numbers/research/capture', requireRole('admin', 'creator'), async (req, res) => {
  try {
    const inspection = await inspectNumbersResearchInput(); const db = readStore(); const job = createNumbersResearchJob(inspection, req.user.id);
    db.numbersResearchJobs ||= []; db.numbersResearchJobs.unshift(job); db.numbersResearchJobs = db.numbersResearchJobs.slice(0, 30);
    auditAndSave(db, req.user, 'numbers.research_captured', 'numbers_research_job', job.id, { inputRows: job.inputs.length, inputFingerprint: job.template.inputFingerprint, tableName: job.template.inputTableName });
    res.status(201).json({ job });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/mac/numbers/research/:id/results', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = numbersResearchJobForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  try {
    const job = saveManualResearchResult(found.job, req.body || {}); db.numbersResearchJobs[db.numbersResearchJobs.indexOf(found.job)] = job;
    auditAndSave(db, req.user, 'numbers.research_result_saved', 'numbers_research_job', job.id, { inputId: req.body?.inputId, resultCount: job.results.length }); res.json({ job });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/mac/numbers/research/:id/demo-results', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = numbersResearchJobForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  try {
    const job = loadControlledResearchResults(found.job, controlledDemoOrigin); db.numbersResearchJobs[db.numbersResearchJobs.indexOf(found.job)] = job;
    auditAndSave(db, req.user, 'numbers.research_controlled_demo_loaded', 'numbers_research_job', job.id, { resultCount: job.results.length }); res.json({ job, message: 'Controlled demo values loaded. They are not live Bing results.' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/mac/numbers/research/:id/prepare', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = numbersResearchJobForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  try {
    const job = prepareNumbersResearchProposal(found.job); db.numbersResearchJobs[db.numbersResearchJobs.indexOf(found.job)] = job;
    auditAndSave(db, req.user, 'numbers.research_proposal_prepared', 'numbers_research_job', job.id, { rows: job.proposal.rowCount, proposalFingerprint: job.proposal.fingerprint }); res.json({ job });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/mac/numbers/research/:id/approve', requireRole('admin', 'creator'), async (req, res) => {
  const db = readStore(); const found = numbersResearchJobForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  if (req.body?.confirmed !== true) return res.status(400).json({ error: 'Review the table diff and explicitly confirm the Numbers write.' });
  try {
    const job = await writeApprovedNumbersResearch(found.job, writeNumbersResearchResults); db.numbersResearchJobs[db.numbersResearchJobs.indexOf(found.job)] = job;
    auditAndSave(db, req.user, 'numbers.research_written', 'numbers_research_job', job.id, { approvedRows: job.proof.approvedRows, proposalFingerprint: job.proof.proposalFingerprint, outputTable: job.proof.output.tableName }); res.json({ job, message: `${job.proof.approvedRows} approved research rows were written to Numbers.` });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/resume/jobs', (req, res) => res.json(listResumeJobs(readStore(), req.user)));
app.post('/api/resume/jobs/analyze', requireRole('admin', 'creator'), resumeUpload.single('resume'), async (req, res) => {
  try {
    const resume = await extractResumeText(req.file); const db = readStore(); const job = createResumeJob(db, req.user.id, resume, req.body?.jobDescription);
    auditAndSave(db, req.user, 'resume.analyzed', 'resume_job', job.id, { resumeFileName: job.input.resume.fileName, resumeHash: job.input.resume.sha256, jobDescriptionHash: job.input.jobDescriptionHash, requirements: job.summary.total });
    res.status(201).json({ job: resumeJobResponse(job) });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/resume/jobs/:id/export', requireRole('admin', 'creator'), async (req, res) => {
  try {
    const db = readStore(); const job = resumeJobForUser(db, req.user, req.params.id);
    if (!job) return res.status(404).json({ error: 'Resume alignment job not found.' });
    const artifact = await exportResumeReview(job, Array.isArray(req.body?.selectedSuggestionIds) ? req.body.selectedSuggestionIds : []);
    auditAndSave(db, req.user, 'resume.exported', 'resume_job', job.id, { exportId: artifact.id, exportHash: artifact.sha256, selectedSuggestionCount: artifact.selectedSuggestionIds.length });
    res.json({ job: resumeJobResponse(job), artifact });
  } catch (error) { res.status(400).json({ error: `Resume review copy could not be generated: ${error.message}` }); }
});
app.get('/api/resume/jobs/:id/proof', (req, res) => {
  const job = resumeJobForUser(readStore(), req.user, req.params.id);
  if (!job) return res.status(404).json({ error: 'Resume alignment job not found.' });
  res.attachment(`resume-alignment-proof-${job.id}.json`).type('application/json').send(JSON.stringify(resumeProof(job), null, 2));
});
app.get('/api/resume/jobs/:id/exports/:exportId', (req, res) => {
  const job = resumeJobForUser(readStore(), req.user, req.params.id); const artifact = job?.exports?.find(item => item.id === req.params.exportId);
  if (!artifact) return res.status(404).json({ error: 'Resume review copy not found.' });
  const target = resumeExportPath(artifact);
  if (!target || !fs.existsSync(target)) return res.status(404).json({ error: 'Resume review copy is no longer available.' });
  res.download(target, artifact.filename);
});
app.delete('/api/resume/jobs/:id', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const job = resumeJobForUser(db, req.user, req.params.id);
  if (!job) return res.status(404).json({ error: 'Resume alignment job not found.' });
  for (const artifact of job.exports || []) { const target = resumeExportPath(artifact); if (target && fs.existsSync(target)) fs.rmSync(target, { force: true }); }
  db.resumeJobs = db.resumeJobs.filter(item => item.id !== job.id); auditAndSave(db, req.user, 'resume.deleted', 'resume_job', job.id, { exportsDeleted: job.exports?.length || 0 }); res.status(204).end();
});
app.get('/api/workflows', (req, res) => {
  const db = readStore(); backfillSopRuleBooks(db);
  res.json(visibleWorkflows(db, req.user).map(workflowResponse));
});
app.post('/api/workflows', requireRole('admin', 'creator'), (req, res) => {
  if (!req.body?.name?.trim()) return res.status(400).json({ error: 'A workflow name is required.' });
  const checkedUrl = validateAutomationUrl(req.body.startUrl);
  if (checkedUrl.error) return res.status(400).json({ error: checkedUrl.error });
  const db = readStore(); const workflow = createWorkflow({ ...req.body, startUrl: checkedUrl.value }, req.user.id);
  db.workflows.unshift(workflow); addWorkdayEvent(db, req.user.id, { type: 'job_created', label: `Created job “${workflow.name}”`, workflowId: workflow.id }); auditAndSave(db, req.user, 'workflow.created', 'workflow', workflow.id, { name: workflow.name });
  res.status(201).json(workflowResponse(workflow));
});
app.post('/api/workflows/starter-jobs', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const created = createStarterWorkflows(db, req.user.id);
  for (const workflow of created) audit(db, req.user, 'workflow.starter_created', 'workflow', workflow.id, { starterKey: workflow.starterKey });
  writeStore(db); res.status(created.length ? 201 : 200).json({ workflows: created.map(workflowResponse), message: created.length ? `${created.length} verified starter jobs were added.` : 'Your verified starter jobs are already in the library.' });
});
app.post('/api/workflows/controlled-demo-jobs', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const created = createControlledDemoWorkflows(db, req.user.id, controlledDemoOrigin);
  for (const workflow of created) audit(db, req.user, 'workflow.controlled_demo_created', 'workflow', workflow.id, { controlledDemoKey: workflow.controlledDemoKey });
  writeStore(db); res.status(created.length ? 201 : 200).json({ workflows: created.map(workflowResponse), message: created.length ? `${created.length} controlled demo jobs were added.` : 'Your five controlled demo jobs are already in the library.' });
});
app.post('/api/workflows/:id/record', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const workflow = found.workflow;
  if (workflow.platform !== 'browser') return res.status(400).json({ error: 'Browser recording is the available MVP adapter. Desktop/mobile adapters are upcoming.' });
  if (workflow.status === 'Recording') return res.status(409).json({ error: 'This workflow is already recording. Finish and close the recorder browser first.' });
  workflow.status = 'Recording'; workflow.recordingError = null; workflow.updatedAt = new Date().toISOString();
  const started = launchRecorder(workflow, outcome => {
    const next = readStore(); const current = next.workflows.find(item => item.id === workflow.id);
    if (!current) return;
    current.updatedAt = new Date().toISOString(); current.pendingRecordingFile = null; current.pendingCaptureVersion = null;
    if (outcome.recording.ready) {
      current.status = 'Recorded'; current.recordedAt = current.updatedAt; current.recordingError = null; current.recordingFile = outcome.filename; current.captureVersion = outcome.captureVersion; current.script = null; current.execution = null;
      current.waits = current.pendingWaits || []; current.pendingWaits = [];
      current.steps = outcome.recording.steps; current.recordedSteps = outcome.recording.steps; current.optimizedSteps = [];
      current.riskySteps = outcome.recording.riskySteps;
      current.recordingReliability = outcome.recording.reliability;
      current.redactedSecrets = outcome.recording.redactedSecrets || 0;
      current.sop = writeSopRuleBook(current);
      audit(next, req.user, 'workflow.recorded', 'workflow', current.id, { stepCount: current.steps.length, redactedSecrets: current.redactedSecrets, sopRevision: current.sop.revision });
    } else {
      current.pendingWaits = [];
      current.status = current.script ? 'Ready to run' : 'Draft'; current.recordingError = outcome.error || 'No complete browser recording was saved. Your previous completed capture was kept unchanged.';
      audit(next, req.user, 'workflow.recording_failed', 'workflow', current.id);
    }
    writeStore(next);
  });
  workflow.pendingRecordingFile = started.pendingFilename; workflow.pendingCaptureVersion = started.captureVersion; workflow.pendingWaits = []; addWorkdayEvent(db, req.user.id, { type: 'recording_started', label: `Started recording “${workflow.name}”`, workflowId: workflow.id }); auditAndSave(db, req.user, 'workflow.recording_started', 'workflow', workflow.id, { captureVersion: started.captureVersion });
  res.json({ workflow: workflowResponse(workflow), ...started });
});
app.get('/api/workflows/:id/recording', (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const workflow = found.workflow; const recording = getRecording({ ...workflow, recordingFile: workflow.status === 'Recording' ? workflow.pendingRecordingFile : workflow.recordingFile }, { persistRedaction: workflow.status !== 'Recording' });
  res.json({ workflow: workflowResponse({ ...workflow, recordingReliability: recording.reliability }), ...recording });
});
app.get('/api/workflows/:id/sop', (req, res) => {
  const found = workflowForUser(readStore(), req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const sop = found.workflow.sop;
  if (!sop?.filename) return res.status(404).json({ error: 'The SOP and Rule Book will be available after a completed recording.' });
  const target = path.resolve('automations', path.basename(sop.filename));
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'The saved SOP and Rule Book file is unavailable. Re-record this job to recreate it.' });
  res.type('text/markdown; charset=utf-8').download(target, sop.filename);
});
app.post('/api/workflows/:id/recording/waits', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  if (found.workflow.status !== 'Recording') return res.status(409).json({ error: 'Open the recorder before queuing a live wait.' });
  const preview = getRecording({ ...found.workflow, recordingFile: found.workflow.pendingRecordingFile }, { persistRedaction: false });
  try {
    found.workflow.pendingWaits = configureWait({ ...found.workflow, recordingFile: found.workflow.pendingRecordingFile, waits: found.workflow.pendingWaits || [] }, req.body, preview);
    found.workflow.updatedAt = new Date().toISOString(); auditAndSave(db, req.user, 'workflow.live_wait_queued', 'workflow', found.workflow.id, { afterStepNumber: req.body.afterStepNumber, milliseconds: req.body.milliseconds });
    res.json({ workflow: workflowResponse(found.workflow), liveSteps: preview.steps });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.post('/api/workflows/:id/feedback', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const [updated, added] = parseFeedback(req.body.feedback || '', found.workflow); db.workflows[db.workflows.indexOf(found.workflow)] = updated;
  const requiresRebuild = Boolean(updated.recordingFile && updated.status !== 'Recording');
  if (requiresRebuild) {
    updated.status = 'Recorded'; updated.script = null; updated.execution = null; updated.optimizedSteps = []; updated.optimization = []; updated.updatedAt = new Date().toISOString();
  }
  if (updated.recordingFile) updated.sop = writeSopRuleBook(updated);
  auditAndSave(db, req.user, 'workflow.note_saved', 'workflow', updated.id, { learned: added, requiresRebuild, sopRevision: updated.sop?.revision }); res.json({ workflow: workflowResponse(updated), learned: added, requiresRebuild });
});
app.post('/api/workflows/:id/waits', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  try {
    found.workflow.waits = configureWait(found.workflow, req.body); found.workflow.status = 'Recorded'; found.workflow.script = null; found.workflow.execution = null; found.workflow.optimizedSteps = []; found.workflow.optimization = []; found.workflow.updatedAt = new Date().toISOString(); found.workflow.sop = writeSopRuleBook(found.workflow);
    auditAndSave(db, req.user, 'workflow.wait_configured', 'workflow', found.workflow.id, { afterStepNumber: req.body.afterStepNumber, milliseconds: req.body.milliseconds, sopRevision: found.workflow.sop.revision });
    res.json({ workflow: workflowResponse(found.workflow) });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
});
app.post('/api/workflows/:id/generate', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  try {
    const generated = generateScript(found.workflow, { trustedLocalDemoOrigin: found.workflow.controlledDemo ? controlledDemoOrigin : undefined }); found.workflow.status = 'Ready to run'; found.workflow.script = generated.filename; found.workflow.version = (found.workflow.version || 0) + 1;
    found.workflow.steps = generated.rawSteps; found.workflow.recordedSteps = generated.rawSteps; found.workflow.optimizedSteps = generated.steps; found.workflow.riskySteps = generated.riskySteps; found.workflow.optimization = generated.optimization; found.workflow.execution = generated.execution; found.workflow.recordingReliability = generated.reliability; found.workflow.optimizedAt = new Date().toISOString(); found.workflow.updatedAt = found.workflow.optimizedAt; found.workflow.sop = writeSopRuleBook(found.workflow);
    addWorkdayEvent(db, req.user.id, { type: 'job_prepared', label: `Prepared reusable job “${found.workflow.name}”`, workflowId: found.workflow.id }); auditAndSave(db, req.user, 'workflow.generated', 'workflow', found.workflow.id, { version: found.workflow.version, recordedStepCount: generated.rawSteps.length, optimizedStepCount: generated.steps.length, sopRevision: found.workflow.sop.revision });
    res.json({ workflow: workflowResponse(found.workflow), ...generated });
  } catch (error) { res.status(error.status || 500).json({ error: error.message }); }
});
app.post('/api/workflows/:id/run', requireRole('admin', 'creator', 'runner'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const workflow = found.workflow;
  if (workflow.lastRun?.status === 'Running') return res.status(409).json({ error: 'This job is already running.' });
  if (!req.body?.confirmed) return res.status(400).json({ error: 'Confirm that you want to rerun this browser job.' });
  const runMode = req.body?.runMode || 'background';
  if (!['visible', 'background'].includes(runMode)) return res.status(400).json({ error: 'Choose either a visible browser run or a background run.' });
  let preparedRun;
  try {
    preparedRun = prepareScriptRun(workflow, { runMode, trustedLocalDemoOrigin: workflow.controlledDemo ? controlledDemoOrigin : undefined });
  } catch (error) { return res.status(error.status || 500).json({ error: error.message }); }
  if (runMode === 'background' && !hasVisiblePassForExecution(workflow, preparedRun.execution)) {
    return res.status(409).json({ error: 'Run this exact saved version visibly once before using Background. A re-recorded, changed, or regenerated job always needs a fresh visible rehearsal.' });
  }
  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();
  // Persist the Running state before spawning. A very short job can otherwise
  // finish before this request writes its state, causing a completed result to
  // be overwritten by Running.
  workflow.lastRun = { id: runId, status: 'Running', runMode, startedAt, execution: preparedRun.execution };
  workflow.updatedAt = startedAt;
  addWorkdayEvent(db, req.user.id, { type: 'job_run_started', label: `Started ${runMode} replay “${workflow.name}”`, workflowId: workflow.id }); auditAndSave(db, req.user, 'workflow.run_started', 'workflow', workflow.id, { runMode });
  try {
    const started = runScript(workflow, { runMode, trustedLocalDemoOrigin: workflow.controlledDemo ? controlledDemoOrigin : undefined, preparedRun }, outcome => {
      const next = readStore(); const current = next.workflows.find(item => item.id === workflow.id);
      if (!current) return;
      const status = outcome.exitCode === 0 ? 'Passed' : 'Failed';
      const completedAt = new Date().toISOString();
      const summary = summarizePlaywrightRun(current, { status, runMode, output: outcome.output, error: outcome.error, timedOut: outcome.timedOut, execution: outcome.execution || preparedRun.execution });
      const lastRun = { id: runId, status, runMode, startedAt, completedAt, durationMs: outcome.durationMs, exitCode: Number.isInteger(outcome.exitCode) ? outcome.exitCode : null, timedOut: Boolean(outcome.timedOut), execution: outcome.execution || preparedRun.execution, ...summary };
      current.lastRun = lastRun; current.runHistory = [lastRun, ...(current.runHistory || [])].slice(0, 20); current.updatedAt = lastRun.completedAt;
      increment(apiMetrics.runs, lastRun.status); addWorkdayEvent(next, req.user.id, { type: lastRun.status === 'Passed' ? 'job_run_passed' : 'job_run_failed', label: `${lastRun.status === 'Passed' ? 'Verified' : 'Finished'} ${runMode} replay “${current.name}”`, workflowId: current.id }); audit(next, req.user, 'workflow.run_finished', 'workflow', current.id, { status: lastRun.status, runMode, durationMs: lastRun.durationMs }); writeStore(next);
    });
    res.json({ workflow: workflowResponse(workflow), ...started });
  } catch (error) {
    const next = readStore(); const current = next.workflows.find(item => item.id === workflow.id);
    if (current?.lastRun?.status === 'Running' && current.lastRun.startedAt === startedAt) {
      const completedAt = new Date().toISOString();
      const summary = summarizePlaywrightRun(current, { status: 'Failed', runMode, error: error.message, execution: preparedRun.execution });
      const failedRun = { id: runId, status: 'Failed', runMode, startedAt, completedAt, durationMs: 0, exitCode: null, timedOut: false, execution: preparedRun.execution, ...summary };
      current.lastRun = failedRun; current.runHistory = [failedRun, ...(current.runHistory || [])].slice(0, 20); current.updatedAt = completedAt;
      audit(next, req.user, 'workflow.run_failed_to_start', 'workflow', current.id, { runMode, error: error.message }); writeStore(next);
    }
    res.status(error.status || 500).json({ error: error.message, workflow: workflowResponse(current || workflow) });
  }
});
app.get('/api/workflows/:id/run', (req, res) => {
  const found = workflowForUser(readStore(), req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const workflow = workflowResponse(found.workflow, { includeTechnicalLog: true });
  res.json({ workflow, lastRun: workflow.lastRun || null });
});
app.get('/api/workflows/:id/runs/:runId/log', (req, res) => {
  const found = workflowForUser(readStore(), req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const run = [found.workflow.lastRun, ...(found.workflow.runHistory || [])].filter(Boolean).find(item => item.id === req.params.runId);
  if (!run) return res.status(404).json({ error: 'Run details not found.' });
  res.json({ runId: run.id, log: run.technicalLog || sanitizeTechnicalLog(run.output || '') });
});
app.post('/api/workflows/:id/duplicate', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  const copy = createWorkflow({ name: `${found.workflow.name} copy`, startUrl: found.workflow.startUrl, platform: found.workflow.platform }, req.user.id);
  db.workflows.unshift(copy); auditAndSave(db, req.user, 'workflow.duplicated', 'workflow', copy.id, { sourceId: found.workflow.id }); res.status(201).json(workflowResponse(copy));
});
app.delete('/api/workflows/:id', requireRole('admin', 'creator'), (req, res) => {
  const db = readStore(); const found = workflowForUser(db, req.params.id, req.user);
  if (found.error) return res.status(found.error[0]).json({ error: found.error[1] });
  db.workflows = db.workflows.filter(item => item.id !== found.workflow.id); auditAndSave(db, req.user, 'workflow.deleted', 'workflow', found.workflow.id, { name: found.workflow.name }); res.status(204).end();
});
app.get('/automations/:filename', (req, res) => {
  const user = sessionUser(readStore(), req.get('authorization'));
  if (!user) return res.status(401).json({ error: 'Sign in to download a saved job.' });
  const filename = path.basename(req.params.filename); const workflow = visibleWorkflows(readStore(), user).find(item => item.script === filename || item.recordingFile === filename);
  if (!workflow) return res.status(404).json({ error: 'Saved job not found.' });
  const target = path.resolve('automations', filename);
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'Saved job file not found.' });
  res.type('text/javascript').sendFile(target);
});
app.get('/api/audit', requireRole('admin'), (req, res) => res.json(readStore().audit || []));
app.get('/api/users', requireRole('admin'), (req, res) => res.json((readStore().users || []).map(publicUser)));
app.patch('/api/users/:id/role', requireRole('admin'), (req, res) => {
  if (!validRole(req.body?.role)) return res.status(400).json({ error: 'Choose admin, creator, runner, or viewer.' });
  const db = readStore(); const user = db.users.find(item => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.id === req.user.id && req.body.role !== 'admin') return res.status(400).json({ error: 'An admin cannot remove their own admin role.' });
  user.role = req.body.role; auditAndSave(db, req.user, 'user.role_changed', 'user', user.id, { role: user.role }); res.json(publicUser(user));
});

app.get('/api/backoffice/demo', (req, res) => {
  try { res.json(backofficeSummary(readStore(), req.user.id)); }
  catch (error) { res.status(500).json({ error: `Unable to read the back-office demo: ${error.message}` }); }
});
app.post('/api/backoffice/demo/queue', requireRole('admin', 'creator', 'runner'), (req, res) => {
  try {
    const db = readStore(); const queue = loadBackofficeQueue(db, req.user.id);
    auditAndSave(db, req.user, 'backoffice.queue_loaded', 'backoffice_queue', queue.id, { sourceCount: queue.source.recordCount, sourceFingerprint: queue.source.fingerprint });
    res.status(201).json({ queue, ...backofficeSummary(db, req.user.id) });
  } catch (error) { res.status(500).json({ error: `Back-office queue could not load: ${error.message}` }); }
});
app.post('/api/backoffice/demo/run', requireRole('admin', 'creator', 'runner'), (req, res) => {
  const db = readStore(); const state = db.backoffice || {}; const queue = (state.queueBatches || []).find(item => item.ownerId === req.user.id && item.status === 'Queued');
  if (!queue) return res.status(409).json({ error: 'Load the source records into a queue before starting background routing.' });
  if ((state.jobs || []).some(item => item.ownerId === req.user.id && item.status === 'Running')) return res.status(409).json({ error: 'A background routing job is already running.' });
  const job = startBackofficeWorker(db, req.user, queue);
  res.status(202).json({ job, ...backofficeSummary(db, req.user.id) });
});
app.post('/api/backoffice/demo/process-jobs/record', requireRole('admin', 'creator', 'runner'), (req, res) => {
  try {
    const db = readStore(); const processJob = recordBackofficeProcess(db, req.user.id);
    auditAndSave(db, req.user, 'backoffice.process_recorded', 'backoffice_process_job', processJob.id, { sourceFingerprint: processJob.capture.source.fingerprint, rulesFingerprint: processJob.capture.rules.fingerprint, stages: processJob.rawPlan.length });
    res.status(201).json({ processJob, ...backofficeSummary(db, req.user.id) });
  } catch (error) { res.status(500).json({ error: `Back-office process could not be captured: ${error.message}` }); }
});
app.post('/api/backoffice/demo/process-jobs/:id/optimize', requireRole('admin', 'creator', 'runner'), (req, res) => {
  try {
    const db = readStore(); const result = optimizeBackofficeProcess(db, req.user.id, req.params.id);
    if (result.error) return res.status(result.error.includes('running') ? 409 : 404).json({ error: result.error });
    auditAndSave(db, req.user, 'backoffice.process_optimized', 'backoffice_process_job', result.processJob.id, { version: result.processJob.version, optimizationCount: result.processJob.optimization.length });
    res.json({ processJob: result.processJob, ...backofficeSummary(db, req.user.id) });
  } catch (error) { res.status(500).json({ error: `Back-office process could not be optimized: ${error.message}` }); }
});
app.post('/api/backoffice/demo/process-jobs/:id/run', requireRole('admin', 'creator', 'runner'), (req, res) => {
  const db = readStore(); const state = db.backoffice || {}; const processJob = processJobForUser(db, req.user.id, req.params.id);
  if (!processJob) return res.status(404).json({ error: 'Saved process job not found.' });
  if (processJob.status !== 'Ready to run') return res.status(409).json({ error: 'Review and optimize this saved process job before running it.' });
  if ((state.jobs || []).some(item => item.ownerId === req.user.id && item.status === 'Running')) return res.status(409).json({ error: 'A background routing job is already running.' });
  try {
    const queue = loadBackofficeQueue(db, req.user.id); const job = startBackofficeWorker(db, req.user, queue, processJob);
    res.status(202).json({ processJob, queue, job, ...backofficeSummary(db, req.user.id) });
  } catch (error) { res.status(500).json({ error: `Saved process job could not start: ${error.message}` }); }
});
app.get('/api/backoffice/demo/runs/:runId/approved-workbook', (req, res) => {
  const db = readStore(); const run = db.backoffice?.runs?.find(item => item.id === req.params.runId && (item.ownerId === req.user.id || req.user.role === 'admin'));
  if (!run) return res.status(404).json({ error: 'The requested back-office export was not found.' });
  const target = approvedWorkbookPath(run);
  if (!target || !fs.existsSync(target)) return res.status(404).json({ error: 'The requested back-office export file is not available.' });
  res.download(target, `financehub-approved-${run.id}.xlsx`);
});
app.get('/api/backoffice/demo/runs/:runId/proof', (req, res) => {
  const db = readStore(); const run = db.backoffice?.runs?.find(item => item.id === req.params.runId && (item.ownerId === req.user.id || req.user.role === 'admin'));
  if (!run) return res.status(404).json({ error: 'The requested back-office proof report was not found.' });
  res.attachment(`backoffice-proof-${run.id}.json`).type('application/json').send(JSON.stringify(proofReport(run), null, 2));
});

// Legacy demo adapters remain private to the signed-in user and are not the default product path.
app.post('/api/shopping/run', (req, res) => res.status(410).json({ error: 'This legacy demo adapter is no longer part of the browser-job product.' }));
app.post('/api/shopping/feedback', (req, res) => res.status(410).json({ error: 'This legacy demo adapter is no longer part of the browser-job product.' }));
app.post('/api/steward/run', (_, res) => res.status(410).json({ error: 'This legacy demo adapter is no longer part of the browser-job product.' }));
app.post('/api/steward/feedback', (_, res) => res.status(410).json({ error: 'This legacy demo adapter is no longer part of the browser-job product.' }));

app.use('/demo-websites', express.static(path.resolve(import.meta.dirname, '..', 'public', 'demo-websites')));
app.use(express.static(path.resolve('dist')));
app.use((err, _, res, __) => res.status(500).json({ error: err.message }));
app.listen(port, () => console.log(`Chayya API on http://localhost:${port}`));
