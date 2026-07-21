import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourcePage = path.resolve(import.meta.dirname, '..', 'public', 'demo-websites', 'acme-invoices.html');
const rulesDocument = path.resolve(import.meta.dirname, '..', 'docs', 'BACKOFFICE_RULES.md');
const defaultMappingWorkbook = path.resolve('data', 'backoffice', 'internal-finance-mapping.xlsx');

const initialMappings = [
  { supplier: 'Northwind Office Supplies', poNumber: 'PO-1001', vendorId: 'VEN-100', legalEntity: 'US01', costCenter: 'OPS-410', maxApprovedAmount: 2500 },
  { supplier: 'Tailspin Logistics', poNumber: 'PO-2001', vendorId: 'VEN-200', legalEntity: 'US01', costCenter: 'LOG-120', maxApprovedAmount: 3000 },
  { supplier: 'Fabrikam Hardware', poNumber: 'PO-1003', vendorId: 'VEN-300', legalEntity: 'US01', costCenter: 'FAC-205', maxApprovedAmount: 8000 }
];

const normalise = value => String(value || '').trim().toLowerCase();
const mappingKey = (supplier, poNumber) => `${normalise(supplier)}|${normalise(poNumber)}`;
const money = amount => Math.round(Number(amount) * 100) / 100;
const fingerprint = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex').slice(0, 12);
const bool = value => String(value).trim().toLowerCase() === 'true';

export function sourceUrl() { return '/demo-websites/acme-invoices.html'; }

export function readRoutingRules(rulePath = rulesDocument) {
  const raw = fs.readFileSync(rulePath, 'utf8');
  const value = key => raw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  const noTouchAmountLimit = Number(value('no_touch_amount_limit'));
  const rules = {
    ruleSet: value('rule_set'), version: value('version'), noTouchAmountLimit,
    requirePurchaseOrder: bool(value('require_purchase_order')),
    requireInternalMapping: bool(value('require_internal_mapping')),
    enforceMappedPoAllowance: bool(value('enforce_mapped_po_allowance')),
    document: 'BACKOFFICE_RULES.md', fingerprint: fingerprint(raw)
  };
  if (!rules.ruleSet || !rules.version || !Number.isFinite(noTouchAmountLimit) || noTouchAmountLimit <= 0) {
    throw new Error('The back-office rules document has missing or invalid configuration.');
  }
  return rules;
}

export function readDemoSource(sourcePath = sourcePage) {
  const html = fs.readFileSync(sourcePath, 'utf8');
  const payload = html.match(/<script id="anukriti-source-invoices" type="application\/json">\s*([\s\S]*?)\s*<\/script>/i)?.[1];
  if (!payload) throw new Error('The bundled Website 1 source payload is missing.');
  const invoices = JSON.parse(payload);
  if (!Array.isArray(invoices) || !invoices.every(invoice => invoice.invoiceId && invoice.supplier && Number.isFinite(Number(invoice.amount)))) {
    throw new Error('The bundled Website 1 source payload is invalid.');
  }
  return invoices.map(invoice => ({ ...invoice, amount: money(invoice.amount) }));
}

export async function ensureInternalMappingWorkbook(workbookPath = defaultMappingWorkbook) {
  if (fs.existsSync(workbookPath)) return workbookPath;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Vendor PO mapping');
  sheet.columns = [
    { header: 'Supplier', key: 'supplier', width: 32 }, { header: 'PO number', key: 'poNumber', width: 16 },
    { header: 'ERP vendor ID', key: 'vendorId', width: 16 }, { header: 'Legal entity', key: 'legalEntity', width: 16 },
    { header: 'Cost center', key: 'costCenter', width: 16 }, { header: 'Maximum approved amount', key: 'maxApprovedAmount', width: 25 }
  ];
  initialMappings.forEach(mapping => sheet.addRow(mapping));
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E6E3D' } };
  sheet.getColumn('maxApprovedAmount').numFmt = '$#,##0.00';
  fs.mkdirSync(path.dirname(workbookPath), { recursive: true });
  await workbook.xlsx.writeFile(workbookPath);
  return workbookPath;
}

export async function readInternalMappings(workbookPath = defaultMappingWorkbook) {
  await ensureInternalMappingWorkbook(workbookPath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(workbookPath);
  const sheet = workbook.getWorksheet('Vendor PO mapping');
  if (!sheet) throw new Error('The internal mapping workbook does not contain the Vendor PO mapping sheet.');
  const mappings = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const [supplier, poNumber, vendorId, legalEntity, costCenter, maxApprovedAmount] = row.values.slice(1);
    if (supplier && poNumber && vendorId) mappings.push({ supplier: String(supplier), poNumber: String(poNumber), vendorId: String(vendorId), legalEntity: String(legalEntity), costCenter: String(costCenter), maxApprovedAmount: money(maxApprovedAmount) });
  });
  return mappings;
}

export function decideInvoice(invoice, mappings, rules = readRoutingRules()) {
  const mapping = mappings.find(candidate => mappingKey(candidate.supplier, candidate.poNumber) === mappingKey(invoice.supplier, invoice.poNumber));
  const reasons = [];
  if (rules.requirePurchaseOrder && !invoice.poNumber) reasons.push('Missing purchase order');
  if (invoice.amount > rules.noTouchAmountLimit) reasons.push(`Amount exceeds the $${rules.noTouchAmountLimit.toLocaleString()} no-touch limit`);
  if (rules.requireInternalMapping && !mapping && invoice.poNumber) reasons.push('No internal vendor and PO mapping found');
  if (rules.enforceMappedPoAllowance && mapping && invoice.amount > mapping.maxApprovedAmount) reasons.push(`Amount exceeds mapped PO allowance of $${mapping.maxApprovedAmount.toLocaleString()}`);
  const status = reasons.length ? 'Exception' : 'Passed';
  return { ...invoice, status, confidence: status === 'Passed' ? 98 : 99, decisionMethod: `${rules.ruleSet} v${rules.version}`, reasons: reasons.length ? reasons : ['Supplier, PO, amount, and internal mapping passed validation'], mapping: mapping || null, target: status === 'Passed' ? 'Website 2 · FinanceHub' : 'Website 3 · ExceptionDesk' };
}

async function writeApprovedWorkbook(decisions, runId, outputDirectory = path.resolve('output')) {
  const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet('FinanceHub load');
  sheet.columns = [
    { header: 'Source invoice ID', key: 'invoiceId', width: 20 }, { header: 'Supplier', key: 'supplier', width: 30 }, { header: 'ERP vendor ID', key: 'vendorId', width: 16 }, { header: 'PO number', key: 'poNumber', width: 16 }, { header: 'Legal entity', key: 'legalEntity', width: 15 }, { header: 'Cost center', key: 'costCenter', width: 16 }, { header: 'Invoice date', key: 'invoiceDate', width: 15 }, { header: 'Amount', key: 'amount', width: 15 }, { header: 'Load status', key: 'loadStatus', width: 18 }
  ];
  decisions.forEach(decision => sheet.addRow({ invoiceId: decision.invoiceId, supplier: decision.supplier, vendorId: decision.mapping.vendorId, poNumber: decision.poNumber, legalEntity: decision.mapping.legalEntity, costCenter: decision.mapping.costCenter, invoiceDate: decision.invoiceDate, amount: decision.amount, loadStatus: 'Loaded to FinanceHub' }));
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E6E3D' } }; sheet.getColumn('amount').numFmt = '$#,##0.00';
  const filename = `financehub-approved-${runId}.xlsx`; fs.mkdirSync(outputDirectory, { recursive: true }); await workbook.xlsx.writeFile(path.join(outputDirectory, filename)); return filename;
}

function backofficeState(db) {
  if (!db.backoffice) db.backoffice = {};
  const state = db.backoffice;
  state.runs ||= []; state.financeHub ||= []; state.exceptionDesk ||= []; state.queueBatches ||= []; state.jobs ||= []; state.processJobs ||= [];
  return state;
}

function capturedProcessSteps(source, rules) {
  return [
    { number: 1, stage: 'Source table', summary: `Read ${source.recordCount} records from ${source.label}.`, evidence: `Source fingerprint ${source.fingerprint}` },
    { number: 2, stage: 'Queue', summary: 'Place the source records in an isolated, fingerprinted input queue.', evidence: 'A new queue batch is created for each execution.' },
    { number: 3, stage: 'Rules document', summary: `Load ${rules.document} v${rules.version} before deciding any record.`, evidence: `Rules fingerprint ${rules.fingerprint}` },
    { number: 4, stage: 'Background worker', summary: 'Read the internal Excel mapping and apply every documented rule outside the browser.', evidence: 'Rule and mapping decisions are retained for every invoice.' },
    { number: 5, stage: 'FinanceHub / ExceptionDesk', summary: 'Load passed records to FinanceHub and route exceptions to ExceptionDesk.', evidence: 'Every invoice has one explicit target and decision reason.' },
    { number: 6, stage: 'Proof', summary: 'Produce a reconciled proof report for the complete execution.', evidence: 'The report contains counts, decisions, hashes, and timestamps.' }
  ];
}

function optimizedProcessSteps(rules) {
  return [
    { number: 1, stage: 'Queue', summary: 'Read Website 1 once and create a fresh, isolated queue batch for this run.' },
    { number: 2, stage: 'Rules and mapping', summary: `Load the fixed ${rules.document} v${rules.version} and internal Excel mapping once.` },
    { number: 3, stage: 'Background worker', summary: 'Apply the same documented criteria to every queued record without replaying browser clicks.' },
    { number: 4, stage: 'Targets and proof', summary: 'Route to FinanceHub or ExceptionDesk, then save one reconciled proof bundle.' }
  ];
}

function structuredIntent(source, rules) {
  const matchedStages = ['source table', 'durable queue', 'versioned rules document', 'background routing', 'two controlled targets', 'proof bundle'];
  return {
    label: 'Invoice routing orchestration',
    summary: `Route ${source.recordCount} invoices using ${rules.document} and internal mapping.`,
    method: 'structured_process_classification',
    confidence: 100,
    matchedStages
  };
}

export function recordBackofficeProcess(db, ownerId) {
  const invoices = readDemoSource(); const rules = readRoutingRules(); const state = backofficeState(db);
  const source = { label: 'Website 1 · ACME Invoice Portal (static demo)', url: sourceUrl(), recordCount: invoices.length, fingerprint: fingerprint(invoices) };
  const capturedAt = new Date().toISOString();
  const processJob = {
    id: crypto.randomUUID(), ownerId, name: 'Invoice routing — recorded business process', status: 'Recorded', version: 1, capturedAt,
    capture: { source, rules: { document: rules.document, version: rules.version, fingerprint: rules.fingerprint }, targets: ['Website 2 · FinanceHub', 'Website 3 · ExceptionDesk'] },
    intent: structuredIntent(source, rules), rawPlan: capturedProcessSteps(source, rules), optimizedPlan: null, optimization: [], executionHistory: [], lastExecution: null
  };
  state.processJobs.unshift(processJob); state.processJobs = state.processJobs.slice(0, 30);
  return processJob;
}

export function processJobForUser(db, ownerId, id) {
  return backofficeState(db).processJobs.find(item => item.id === id && item.ownerId === ownerId) || null;
}

export function optimizeBackofficeProcess(db, ownerId, id) {
  const processJob = processJobForUser(db, ownerId, id);
  if (!processJob) return { error: 'Saved process job not found.' };
  if (processJob.status === 'Running') return { error: 'This saved process job is already running.' };
  const rules = readRoutingRules(); const optimizedAt = new Date().toISOString();
  processJob.status = 'Ready to run'; processJob.version += 1; processJob.optimizedAt = optimizedAt;
  processJob.optimizedPlan = optimizedProcessSteps(rules);
  processJob.optimization = [
    'The source is parsed once into a fresh queue instead of being repeatedly handled in the browser.',
    `The approved ${rules.document} v${rules.version} and Excel mapping are loaded once per run by the background worker.`,
    'All business rules, source records, target decisions, and proof remain intact; no outcome is skipped.',
    'FinanceHub and ExceptionDesk results are reconciled into one downloadable proof bundle.'
  ];
  return { processJob };
}

export function loadBackofficeQueue(db, ownerId, options = {}) {
  const invoices = options.invoices || readDemoSource(options.sourcePath);
  const state = backofficeState(db); const queuedAt = new Date().toISOString();
  const queue = { id: crypto.randomUUID(), ownerId, status: 'Queued', queuedAt, source: { label: 'Website 1 · ACME Invoice Portal (static demo)', url: sourceUrl(), recordCount: invoices.length, fingerprint: fingerprint(invoices) }, records: invoices };
  state.queueBatches.unshift(queue); state.queueBatches = state.queueBatches.slice(0, 30);
  return queue;
}

export async function runBackofficeDemo(db, ownerId, options = {}) {
  const startedMs = Date.now(); const startedAt = options.startedAt || new Date().toISOString();
  const invoices = options.invoices || readDemoSource(options.sourcePath);
  const rules = options.rules || readRoutingRules(options.rulesPath);
  const mappingWorkbookPath = options.mappingWorkbookPath || defaultMappingWorkbook;
  const mappings = await readInternalMappings(mappingWorkbookPath);
  const decisions = invoices.map(invoice => decideInvoice(invoice, mappings, rules)); const id = crypto.randomUUID();
  const approved = decisions.filter(decision => decision.status === 'Passed'); const exceptions = decisions.filter(decision => decision.status === 'Exception');
  const approvedWorkbook = await writeApprovedWorkbook(approved, id, options.outputDirectory); const completedAt = new Date().toISOString();
  const analytics = { total: decisions.length, passed: approved.length, failed: exceptions.length, passRate: Math.round((approved.length / decisions.length) * 100), approvedAmount: money(approved.reduce((total, decision) => total + decision.amount, 0)), exceptionAmount: money(exceptions.reduce((total, decision) => total + decision.amount, 0)) };
  const run = {
    id, ownerId, jobId: options.jobId || null, processJobId: options.processJobId || null, status: 'Completed', at: completedAt, startedAt, completedAt, durationMs: Date.now() - startedMs,
    source: { label: 'Website 1 · ACME Invoice Portal (static demo)', url: sourceUrl(), recordCount: invoices.length },
    decisionEngine: { label: `${rules.ruleSet} v${rules.version} executed in the background`, noTouchAmountLimit: rules.noTouchAmountLimit, rulesDocument: rules.document, rulesVersion: rules.version },
    rules, decisions, analytics, approvedWorkbook,
    proof: { sourceFingerprint: fingerprint(invoices), rulesFingerprint: rules.fingerprint, rulesDocument: rules.document, rulesVersion: rules.version, mappingWorkbook: path.basename(mappingWorkbookPath), mappingRows: mappings.length, queueBatchId: options.queueBatchId || null, processJobId: options.processJobId || null, completedAt, events: [`${invoices.length} records read from Website 1`, `Rules document v${rules.version} loaded`, `${mappings.length} Excel mappings read`, `${approved.length} records loaded to FinanceHub`, `${exceptions.length} records routed to ExceptionDesk`] }
  };
  const state = backofficeState(db); const sourceIds = new Set(invoices.map(invoice => invoice.invoiceId));
  state.financeHub = state.financeHub.filter(record => record.ownerId !== ownerId || !sourceIds.has(record.invoiceId)); state.exceptionDesk = state.exceptionDesk.filter(record => record.ownerId !== ownerId || !sourceIds.has(record.invoiceId));
  state.financeHub.unshift(...approved.map(decision => ({ id: crypto.randomUUID(), ownerId, runId: id, loadedAt: completedAt, invoiceId: decision.invoiceId, supplier: decision.supplier, poNumber: decision.poNumber, amount: decision.amount, vendorId: decision.mapping.vendorId, legalEntity: decision.mapping.legalEntity, costCenter: decision.mapping.costCenter, status: 'Loaded' })));
  state.exceptionDesk.unshift(...exceptions.map(decision => ({ id: crypto.randomUUID(), ownerId, runId: id, routedAt: completedAt, invoiceId: decision.invoiceId, supplier: decision.supplier, poNumber: decision.poNumber, amount: decision.amount, status: 'Needs review', reasons: decision.reasons })));
  state.runs.unshift(run); state.runs = state.runs.slice(0, 30); return run;
}

export function backofficeSummary(db, ownerId) {
  const state = backofficeState(db); const latestQueue = state.queueBatches.find(item => item.ownerId === ownerId) || null;
  const processJobs = state.processJobs.filter(item => item.ownerId === ownerId);
  return { source: { label: 'Website 1 · ACME Invoice Portal (static demo)', url: sourceUrl(), invoices: readDemoSource() }, rules: readRoutingRules(), queue: latestQueue, latestJob: state.jobs.find(item => item.ownerId === ownerId) || null, latestRun: state.runs.find(run => run.ownerId === ownerId) || null, processJobs, latestProcessJob: processJobs[0] || null, financeHub: state.financeHub.filter(record => record.ownerId === ownerId), exceptionDesk: state.exceptionDesk.filter(record => record.ownerId === ownerId) };
}

export function approvedWorkbookPath(run) { const filename = path.basename(run?.approvedWorkbook || ''); return filename ? path.resolve('output', filename) : null; }
export function proofReport(run) { return { runId: run.id, processJobId: run.processJobId, status: run.status, startedAt: run.startedAt, completedAt: run.completedAt, durationMs: run.durationMs, source: run.source, rules: run.rules, analytics: run.analytics, proof: run.proof, targets: { financeHubLoaded: run.analytics.passed, exceptionDeskRouted: run.analytics.failed }, decisions: run.decisions.map(({ invoiceId, status, target, reasons, mapping }) => ({ invoiceId, status, target, reasons, mapping: mapping ? { vendorId: mapping.vendorId, legalEntity: mapping.legalEntity, costCenter: mapping.costCenter } : null })) }; }
