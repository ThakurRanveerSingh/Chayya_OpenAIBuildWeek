import test from 'node:test';
import assert from 'node:assert/strict';
import { addFocusBlock, addWorkdayEvent, clearWorkdayForOwner, endWorkday, startWorkday, workdayForOwner, workdayResponse } from './workday.js';

const morning = '2026-07-20T14:00:00.000Z';

test('starts, tracks, summarizes, and closes a private workday', () => {
  const db = { workdays: [] };
  const day = startWorkday(db, 'owner-1', { intention: 'Turn recurring report work into a reusable job.' }, morning);
  addFocusBlock(day, { title: 'Capture the report workflow', minutes: 25 }, '2026-07-20T14:30:00.000Z');
  addWorkdayEvent(db, 'owner-1', { type: 'job_created', label: 'Created job “Weekly report”', workflowId: 'job-1' }, '2026-07-20T14:35:00.000Z');
  addWorkdayEvent(db, 'owner-1', { type: 'job_run_passed', label: 'Verified replay “Weekly report”', workflowId: 'job-1' }, '2026-07-20T14:40:00.000Z');

  const response = workdayResponse(day);
  assert.equal(workdayForOwner(db, 'owner-1', morning).id, day.id);
  assert.equal(response.summary.focusMinutes, 25);
  assert.equal(response.summary.focusBlocks, 1);
  assert.equal(response.summary.jobsCreated, 1);
  assert.equal(response.summary.replaysPassed, 1);

  endWorkday(day, { reflection: 'The visible replay gave me confidence before background use.' }, '2026-07-20T22:00:00.000Z');
  assert.equal(day.status, 'Closed');
  assert.match(day.reflection, /visible replay/);
});

test('validates workday input and never tracks work before the user starts the day', () => {
  const db = { workdays: [] };
  assert.equal(addWorkdayEvent(db, 'owner-1', { type: 'job_created', label: 'Should not be tracked' }, morning), null);
  const day = startWorkday(db, 'owner-1', {}, morning);
  assert.throws(() => addFocusBlock(day, { title: '', minutes: 25 }, morning), /title is required/);
  assert.throws(() => addFocusBlock(day, { title: 'Too short', minutes: 1 }, morning), /5 to 480/);
  assert.throws(() => startWorkday(db, 'owner-1', {}, morning), /already active/);
  endWorkday(day, {}, '2026-07-20T22:00:00.000Z');
  assert.throws(() => endWorkday(day, {}, '2026-07-20T22:01:00.000Z'), /no active workday/);
});

test('clears only the signed-in owner’s ledger for today', () => {
  const db = { workdays: [] };
  const ownerDay = startWorkday(db, 'owner-1', { intention: 'Start clean.' }, morning);
  const otherOwnerDay = startWorkday(db, 'owner-2', { intention: 'Keep this day.' }, morning);
  const removed = clearWorkdayForOwner(db, 'owner-1', morning);
  assert.equal(removed.id, ownerDay.id);
  assert.equal(workdayForOwner(db, 'owner-1', morning), null);
  assert.equal(workdayForOwner(db, 'owner-2', morning).id, otherOwnerDay.id);
  assert.throws(() => clearWorkdayForOwner(db, 'owner-1', morning), /already clear/);
});
