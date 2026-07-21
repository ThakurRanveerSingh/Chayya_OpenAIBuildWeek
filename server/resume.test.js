import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { analyzeResume, createResumeJob, exportResumeReview, resumeExportPath, resumeProof } from './resume.js';

const resume = {
  fileName: 'ada-resume.txt', extension: '.txt', bytes: 420, sha256: 'resume-sha',
  text: 'Ada Lovelace\nProduct manager with 6 years of product management and data analysis experience. Led cross functional teams and stakeholder management for analytics products.'
};
const jobDescription = 'Senior Product Manager\n- Product management experience with data analysis\n- Strong stakeholder management and cross functional leadership\n- Experience with SQL and market research';

test('compares a local resume to job requirements without inventing claims', () => {
  const analysis = analyzeResume({ resume, jobDescription });

  assert.equal(analysis.intent.label, 'Resume-to-job-description alignment');
  assert.equal(analysis.intent.method, 'structured_local_comparison');
  assert.ok(analysis.summary.total >= 3);
  assert.ok(analysis.requirements.some(item => item.status === 'Evidenced'));
  assert.ok(analysis.requirements.some(item => item.status === 'Not evidenced'));
  assert.match(analysis.suggestions.find(item => item.kind === 'review').detail, /never invent/i);
});

test('exports a separate Word-compatible review copy and proof', async t => {
  const db = {}; const job = createResumeJob(db, 'owner-1', resume, jobDescription);
  const selected = job.suggestions.filter(item => item.kind === 'surface').map(item => item.id);
  const artifact = await exportResumeReview(job, selected);
  const target = resumeExportPath(artifact);
  t.after(() => { if (target && fs.existsSync(target)) fs.rmSync(target, { force: true }); });

  assert.equal(job.status, 'Exported');
  assert.ok(fs.existsSync(target));
  assert.equal(job.exports[0].id, artifact.id);
  assert.equal(resumeProof(job).input.resume.fileName, 'ada-resume.txt');
  assert.deepEqual(artifact.selectedSuggestionIds, selected);
});
