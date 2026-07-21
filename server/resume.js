import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const supportedExtensions = new Set(['.docx', '.txt', '.md']);
const maxResumeBytes = 2 * 1024 * 1024;
const stopWords = new Set(['about', 'across', 'after', 'also', 'and', 'are', 'been', 'being', 'between', 'building', 'business', 'candidate', 'company', 'demonstrated', 'development', 'experience', 'for', 'from', 'have', 'highly', 'into', 'job', 'knowledge', 'looking', 'must', 'our', 'role', 'skills', 'strong', 'team', 'the', 'their', 'this', 'through', 'understanding', 'using', 'with', 'work', 'working', 'years', 'you', 'your']);
const knownPhrases = ['agile delivery', 'business analysis', 'change management', 'cross functional', 'customer success', 'data analysis', 'data visualization', 'financial modeling', 'machine learning', 'market research', 'operations management', 'people management', 'process improvement', 'product management', 'project management', 'risk management', 'software engineering', 'stakeholder management', 'strategic planning', 'supply chain'];

const hash = value => createHash('sha256').update(value).digest('hex');
const clean = value => String(value || '').replace(/\r/g, '').replace(/[\t ]+/g, ' ').trim();
const normalise = value => clean(value).toLowerCase();

function tokens(value) {
  return [...new Set((normalise(value).match(/[a-z][a-z0-9+#.-]{1,}/g) || []).filter(word => !stopWords.has(word)))];
}

function evidenceFor(text, keyword) {
  const sentence = text.split(/(?<=[.!?])\s+|\n+/).map(clean).find(line => normalise(line).includes(keyword));
  return sentence ? sentence.slice(0, 240) : null;
}

function requirementCandidates(jobDescription) {
  const lines = jobDescription.split('\n').map(clean).filter(Boolean);
  const explicit = lines.filter(line => /^[-•*]|\b(required|qualifications?|must have|responsibilities|what you|skills?)\b/i.test(line)).slice(0, 12);
  const candidates = explicit.length ? explicit : tokens(jobDescription).slice(0, 10).map(keyword => keyword.toUpperCase());
  const seen = new Set();
  return candidates.map((text, index) => {
    const lower = normalise(text);
    const phrases = knownPhrases.filter(phrase => lower.includes(phrase));
    const keywords = [...new Set([...phrases, ...tokens(text)])].slice(0, 8);
    const key = normalise(text).replace(/[^a-z0-9]+/g, '-').slice(0, 42) || `requirement-${index + 1}`;
    if (seen.has(key) || !keywords.length) return null;
    seen.add(key);
    return { id: `requirement-${index + 1}-${key}`, text, keywords };
  }).filter(Boolean);
}

export async function extractResumeText(file) {
  if (!file?.buffer?.length) throw new Error('Choose a non-empty .docx, .txt, or .md resume file.');
  if (file.size > maxResumeBytes) throw new Error('The resume file is larger than 2 MB. Use a smaller text-based .docx, .txt, or .md file.');
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!supportedExtensions.has(extension)) throw new Error('Use a .docx, .txt, or .md resume file. PDF and legacy .doc files are not supported in this local demo.');
  const result = extension === '.docx' ? await mammoth.extractRawText({ buffer: file.buffer }) : { value: file.buffer.toString('utf8') };
  const text = clean(result.value).replace(/\n{3,}/g, '\n\n');
  if (text.length < 40) throw new Error('No usable resume text was found. Export the resume as a text-based .docx or upload a .txt/.md version.');
  return { text, extension, fileName: path.basename(file.originalname), bytes: file.size, sha256: hash(file.buffer) };
}

export function analyzeResume({ resume, jobDescription }) {
  const description = clean(jobDescription);
  if (description.length < 40) throw new Error('Paste a job description with at least 40 characters.');
  const requirements = requirementCandidates(description);
  if (!requirements.length) throw new Error('The job description does not contain enough readable requirements. Paste the responsibilities or qualifications section.');
  const resumeLower = normalise(resume.text);
  const comparison = requirements.map(requirement => {
    const matchedTerms = requirement.keywords.filter(keyword => resumeLower.includes(keyword));
    const evidence = matchedTerms.map(keyword => ({ keyword, text: evidenceFor(resume.text, keyword) })).filter(item => item.text).slice(0, 2);
    const status = matchedTerms.length ? 'Evidenced' : 'Not evidenced';
    return { ...requirement, status, matchedTerms, evidence };
  });
  const suggestions = comparison.map(item => ({
    id: `suggestion-${item.id}`,
    requirementId: item.id,
    kind: item.status === 'Evidenced' ? 'surface' : 'review',
    title: item.status === 'Evidenced' ? `Surface existing evidence for ${item.matchedTerms.slice(0, 2).join(' and ')}` : `Review whether you can truthfully evidence: ${item.keywords.slice(0, 3).join(', ')}`,
    detail: item.status === 'Evidenced'
      ? `The resume already mentions ${item.matchedTerms.slice(0, 3).join(', ')}. Consider placing that evidence closer to the summary or relevant role.`
      : 'No matching text was found. Add this only if it is accurate; this tool will never invent experience, metrics, employers, education, or dates.'
  }));
  const evidenced = comparison.filter(item => item.status === 'Evidenced').length;
  return {
    intent: { label: 'Resume-to-job-description alignment', method: 'structured_local_comparison', confidence: 100, matchedStages: ['local resume input', 'job-description requirements', 'evidence comparison', 'human review', 'Word-compatible export', 'proof'] },
    requirements: comparison,
    suggestions,
    summary: { total: comparison.length, evidenced, notEvidenced: comparison.length - evidenced, evidenceRate: Math.round((evidenced / comparison.length) * 100) },
    jobDescriptionHash: hash(description)
  };
}

function resumeState(db) {
  db.resumeJobs ||= [];
  return db.resumeJobs;
}

export function createResumeJob(db, ownerId, resume, jobDescription) {
  const analysis = analyzeResume({ resume, jobDescription }); const createdAt = new Date().toISOString();
  const job = {
    id: crypto.randomUUID(), ownerId, status: 'Reviewed', createdAt, updatedAt: createdAt, name: `Resume alignment — ${resume.fileName}`,
    input: { resume: { fileName: resume.fileName, extension: resume.extension, bytes: resume.bytes, sha256: resume.sha256 }, jobDescriptionHash: analysis.jobDescriptionHash },
    resumeText: resume.text, jobDescription: clean(jobDescription), intent: analysis.intent, requirements: analysis.requirements, suggestions: analysis.suggestions, summary: analysis.summary, selectedSuggestionIds: [], exports: []
  };
  const jobs = resumeState(db); jobs.unshift(job); db.resumeJobs = jobs.slice(0, 20); return job;
}

export function resumeJobForUser(db, user, id) {
  const job = resumeState(db).find(item => item.id === id);
  if (!job || (job.ownerId !== user.id && user.role !== 'admin')) return null;
  return job;
}

export function listResumeJobs(db, user) { return resumeState(db).filter(item => item.ownerId === user.id || user.role === 'admin').map(({ resumeText, jobDescription, ...job }) => job); }

export function resumeJobResponse(job) {
  const { resumeText, jobDescription, ...safe } = job;
  return { ...safe, resumePreview: resumeText.slice(0, 1200), jobDescriptionPreview: jobDescription.slice(0, 1200) };
}

export async function exportResumeReview(job, selectedSuggestionIds = []) {
  const allowed = new Set(job.suggestions.map(item => item.id));
  const selected = [...new Set(selectedSuggestionIds)].filter(id => allowed.has(id));
  const selectedSuggestions = job.suggestions.filter(item => selected.includes(item.id));
  const document = new Document({ sections: [{ properties: {}, children: [
    new Paragraph({ text: 'Resume alignment review copy', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: 'Generated locally by Chayya. ', bold: true }), new TextRun('Review every note before sending. No experience, employer, date, metric, or qualification was invented.')]}),
    new Paragraph({ text: 'Approved review notes', heading: HeadingLevel.HEADING_1 }),
    ...(selectedSuggestions.length ? selectedSuggestions.map(item => new Paragraph({ text: item.title, bullet: { level: 0 } })) : [new Paragraph('No review notes were selected. The original resume content is preserved below.')]),
    new Paragraph({ text: 'Original resume content', heading: HeadingLevel.HEADING_1 }),
    ...job.resumeText.split(/\n+/).map(line => new Paragraph(clean(line) || ' '))
  ] }] });
  const filename = `resume-alignment-${job.id.slice(0, 8)}-${Date.now()}.docx`;
  const outputDirectory = path.resolve('output', 'resume'); const target = path.join(outputDirectory, filename);
  fs.mkdirSync(outputDirectory, { recursive: true }); await fs.promises.writeFile(target, await Packer.toBuffer(document));
  const exportedAt = new Date().toISOString(); const artifact = { id: crypto.randomUUID(), filename, exportedAt, selectedSuggestionIds: selected, sha256: hash(await fs.promises.readFile(target)) };
  job.selectedSuggestionIds = selected; job.exports.unshift(artifact); job.exports = job.exports.slice(0, 10); job.updatedAt = exportedAt; job.status = 'Exported'; return artifact;
}

export function resumeExportPath(artifact) { const filename = path.basename(artifact?.filename || ''); return filename ? path.resolve('output', 'resume', filename) : null; }

export function resumeProof(job) {
  return { jobId: job.id, status: job.status, createdAt: job.createdAt, updatedAt: job.updatedAt, intent: job.intent, input: job.input, summary: job.summary, requirements: job.requirements.map(({ id, text, keywords, status, matchedTerms, evidence }) => ({ id, text, keywords, status, matchedTerms, evidence })), selectedSuggestionIds: job.selectedSuggestionIds, exports: job.exports };
}
