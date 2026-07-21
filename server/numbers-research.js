import crypto from 'node:crypto';

const maxRows = 25;
const demoValues = [72, 64, 58, 91, 47, 83, 69, 55, 76, 62];

const fingerprint = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const timestamp = () => new Date().toISOString();

export function visibleNumbersResearchJobs(db, user) {
  return (db.numbersResearchJobs || []).filter(job => job.ownerId === user.id || user.role === 'admin');
}

export function numbersResearchJobForUser(db, id, user) {
  const job = (db.numbersResearchJobs || []).find(item => item.id === id);
  if (!job) return { error: [404, 'Numbers research job not found.'] };
  if (job.ownerId !== user.id && user.role !== 'admin') return { error: [403, 'You do not have access to this Numbers research job.'] };
  return { job };
}

export function createNumbersResearchJob({ table, inputs, inspectedAt }, ownerId) {
  if (!Array.isArray(inputs) || !inputs.length || inputs.length > maxRows) throw new Error('A Numbers research job needs 1 to 25 validated input rows.');
  const createdAt = timestamp();
  return {
    id: crypto.randomUUID(),
    ownerId,
    status: 'Researching',
    template: {
      documentName: table.documentName,
      sheetName: table.sheetName,
      inputTableName: table.tableName,
      inputFingerprint: fingerprint(inputs),
      capturedAt: inspectedAt || createdAt
    },
    inputs,
    results: [],
    proposal: null,
    proof: null,
    createdAt,
    updatedAt: createdAt
  };
}

function normalizeValue(rawValue) {
  const normalized = String(rawValue ?? '').trim().replace(/[$,\s]/g, '');
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) throw new Error('Enter a numeric research value, for example 72.5.');
  const value = Number(normalized);
  if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000) throw new Error('Enter a finite research value within the supported range.');
  return Number(value.toFixed(4));
}

export function validateResearchSourceUrl(rawUrl) {
  let url;
  try { url = new URL(String(rawUrl || '').trim()); } catch { throw new Error('Enter the HTTPS page URL where you verified this value.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use a public HTTPS source URL without embedded credentials.');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '::1' || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    throw new Error('Local and private-network source URLs cannot be stored as research evidence.');
  }
  return url.toString();
}

export function saveManualResearchResult(job, payload) {
  if (job.status === 'Written') throw new Error('This Numbers update is already written. Capture a new research run to change it.');
  const input = job.inputs.find(item => item.id === payload?.inputId);
  if (!input) throw new Error('Choose a research row from this job.');
  const result = {
    inputId: input.id,
    value: normalizeValue(payload.value),
    sourceUrl: validateResearchSourceUrl(payload.sourceUrl),
    checkedAt: timestamp(),
    status: 'Verified by user'
  };
  const results = [...job.results.filter(item => item.inputId !== input.id), result];
  return { ...job, results, proposal: null, status: 'Researching', updatedAt: timestamp() };
}

export function loadControlledResearchResults(job, origin) {
  if (job.status === 'Written') throw new Error('This Numbers update is already written. Capture a new research run to change it.');
  const base = String(origin || '').replace(/\/$/, '');
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) throw new Error('The controlled research demo is available only from this local Anukriti server.');
  const checkedAt = timestamp();
  const results = job.inputs.map((input, index) => ({
    inputId: input.id,
    value: demoValues[index % demoValues.length],
    sourceUrl: `${base}/demo-websites/anukriti-numbers-research.html#${encodeURIComponent(input.id)}`,
    checkedAt,
    status: 'Controlled demo value'
  }));
  return { ...job, results, proposal: null, status: 'Researching', updatedAt: checkedAt, demoMode: true };
}

export function prepareNumbersResearchProposal(job) {
  if (job.status === 'Written') throw new Error('This Numbers update is already written. Capture a new research run to create a new proposal.');
  const resultByInputId = new Map(job.results.map(result => [result.inputId, result]));
  const missing = job.inputs.filter(input => !resultByInputId.has(input.id));
  if (missing.length) throw new Error(`Add and save a verified result for: ${missing.map(item => item.searchTerm).join(', ')}.`);
  const rows = job.inputs.map(input => {
    const result = resultByInputId.get(input.id);
    return { searchTerm: input.searchTerm, metric: input.metric, value: result.value, sourceUrl: result.sourceUrl, checkedAt: result.checkedAt, status: result.status };
  });
  const preparedAt = timestamp();
  return {
    ...job,
    status: 'Ready to write',
    proposal: { rows, rowCount: rows.length, fingerprint: fingerprint(rows), preparedAt },
    updatedAt: preparedAt
  };
}

export async function writeApprovedNumbersResearch(job, writer) {
  if (job.status !== 'Ready to write' || !job.proposal?.rows?.length) throw new Error('Prepare and review the Numbers update before approving the write.');
  const receipt = await writer(job.proposal.rows);
  if (receipt.rows !== job.proposal.rowCount) throw new Error('Numbers confirmed a different number of rows than the approved proposal. No run proof was saved.');
  const completedAt = timestamp();
  return {
    ...job,
    status: 'Written',
    proof: {
      inputFingerprint: job.template.inputFingerprint,
      proposalFingerprint: job.proposal.fingerprint,
      approvedRows: job.proposal.rowCount,
      output: receipt,
      completedAt
    },
    updatedAt: completedAt
  };
}
