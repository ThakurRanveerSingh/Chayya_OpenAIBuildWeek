import test from 'node:test';
import assert from 'node:assert/strict';
import { createNumbersResearchJob, loadControlledResearchResults, prepareNumbersResearchProposal, saveManualResearchResult, validateResearchSourceUrl, writeApprovedNumbersResearch } from './numbers-research.js';

const source = {
  table: { documentName: 'Research template', sheetName: 'Research', tableName: 'Anukriti Research Input' },
  inputs: [
    { id: 'input-1', searchTerm: 'Flowood MS', metric: 'Median home price' },
    { id: 'input-2', searchTerm: 'AAPL', metric: 'Momentum score' }
  ],
  inspectedAt: '2026-07-19T00:00:00.000Z'
};

test('keeps research values as a reviewed proposal until an explicit approved write', async () => {
  let job = createNumbersResearchJob(source, 'owner-1');
  assert.equal(job.status, 'Researching');
  job = saveManualResearchResult(job, { inputId: 'input-1', value: '$285,000', sourceUrl: 'https://www.example.com/flowood' });
  job = saveManualResearchResult(job, { inputId: 'input-2', value: '72.5', sourceUrl: 'https://www.example.com/aapl' });
  job = prepareNumbersResearchProposal(job);

  assert.equal(job.status, 'Ready to write');
  assert.deepEqual(job.proposal.rows.map(row => row.value), [285000, 72.5]);
  let writtenRows;
  job = await writeApprovedNumbersResearch(job, async rows => {
    writtenRows = rows;
    return { rows: rows.length, documentName: 'Research template', sheetName: 'Research', tableName: 'Anukriti Research Results' };
  });
  assert.equal(job.status, 'Written');
  assert.equal(writtenRows.length, 2);
  assert.equal(job.proof.approvedRows, 2);
  assert.throws(() => saveManualResearchResult(job, { inputId: 'input-1', value: '1', sourceUrl: 'https://www.example.com/again' }), /already written/);
});

test('rejects unsafe source evidence and clearly labels the controlled fallback', () => {
  assert.throws(() => validateResearchSourceUrl('http://example.com/value'), /public HTTPS/);
  assert.throws(() => validateResearchSourceUrl('https://127.0.0.1/value'), /Local and private-network/);
  assert.equal(validateResearchSourceUrl('https://example.com/value'), 'https://example.com/value');
  const controlled = loadControlledResearchResults(createNumbersResearchJob(source, 'owner-1'), 'http://127.0.0.1:3111');
  assert.equal(controlled.results.length, 2);
  assert.ok(controlled.results.every(result => result.status === 'Controlled demo value'));
});
