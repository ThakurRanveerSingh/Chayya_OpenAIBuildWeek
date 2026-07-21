const dayKey = (now = new Date()) => new Date(now).toISOString().slice(0, 10);
const cleanText = (value, label, { required = false, max = 240 } = {}) => {
  const text = String(value || '').trim();
  if (required && !text) {
    const error = new Error(`${label} is required.`);
    error.status = 400;
    throw error;
  }
  if (text.length > max) {
    const error = new Error(`${label} must be ${max} characters or fewer.`);
    error.status = 400;
    throw error;
  }
  return text;
};

export function workdayForOwner(db, ownerId, now = new Date()) {
  return (db.workdays || []).find(item => item.ownerId === ownerId && item.date === dayKey(now)) || null;
}

export function clearWorkdayForOwner(db, ownerId, now = new Date()) {
  const workday = workdayForOwner(db, ownerId, now);
  if (!workday) {
    const error = new Error('Today’s ledger is already clear.');
    error.status = 404;
    throw error;
  }
  db.workdays = (db.workdays || []).filter(item => item.id !== workday.id);
  return workday;
}

export function workdayResponse(workday) {
  if (!workday) return null;
  const events = workday.events || [];
  const focusMinutes = (workday.focusBlocks || []).reduce((total, item) => total + item.minutes, 0);
  const count = type => events.filter(item => item.type === type).length;
  const uniqueWorkflows = type => new Set(events.filter(item => item.type === type).map(item => item.workflowId).filter(Boolean)).size;
  return {
    ...workday,
    summary: {
      focusMinutes,
      focusBlocks: (workday.focusBlocks || []).length,
      jobsCreated: uniqueWorkflows('job_created'),
      recordingsStarted: uniqueWorkflows('recording_started'),
      jobsPrepared: uniqueWorkflows('job_prepared'),
      replaysStarted: count('job_run_started'),
      replaysPassed: count('job_run_passed')
    }
  };
}

export function startWorkday(db, ownerId, input = {}, now = new Date()) {
  const existing = workdayForOwner(db, ownerId, now);
  if (existing?.status === 'Active') {
    const error = new Error('Today is already active. Add a focus block or continue your work.');
    error.status = 409;
    throw error;
  }
  const startedAt = new Date(now).toISOString();
  const workday = {
    id: crypto.randomUUID(),
    ownerId,
    date: dayKey(now),
    status: 'Active',
    intention: cleanText(input.intention, 'Morning intention', { max: 240 }),
    startedAt,
    endedAt: null,
    reflection: '',
    focusBlocks: [],
    events: [{ id: crypto.randomUUID(), at: startedAt, type: 'day_started', label: 'Started the workday' }]
  };
  db.workdays ||= [];
  if (existing) db.workdays[db.workdays.indexOf(existing)] = workday;
  else db.workdays.unshift(workday);
  db.workdays = db.workdays.slice(0, 120);
  return workday;
}

export function addFocusBlock(workday, input = {}, now = new Date()) {
  if (!workday || workday.status !== 'Active') {
    const error = new Error('Start today before adding a focus block.');
    error.status = 409;
    throw error;
  }
  const title = cleanText(input.title, 'Focus block title', { required: true, max: 120 });
  const minutes = Number(input.minutes);
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) {
    const error = new Error('Focus time must be a whole number from 5 to 480 minutes.');
    error.status = 400;
    throw error;
  }
  const at = new Date(now).toISOString();
  const block = { id: crypto.randomUUID(), title, minutes, at };
  workday.focusBlocks ||= [];
  workday.events ||= [];
  workday.focusBlocks.unshift(block);
  workday.events.unshift({ id: crypto.randomUUID(), at, type: 'focus_logged', label: `Logged ${minutes} minutes: ${title}` });
  return block;
}

export function addWorkdayEvent(db, ownerId, event, now = new Date()) {
  const workday = workdayForOwner(db, ownerId, now);
  if (!workday || workday.status !== 'Active') return null;
  const at = new Date(now).toISOString();
  const type = cleanText(event?.type, 'Workday event type', { required: true, max: 60 });
  const label = cleanText(event?.label, 'Workday event label', { required: true, max: 180 });
  workday.events ||= [];
  workday.events.unshift({ id: crypto.randomUUID(), at, type, label, workflowId: event?.workflowId || null });
  workday.events = workday.events.slice(0, 120);
  return workday;
}

export function endWorkday(workday, input = {}, now = new Date()) {
  if (!workday || workday.status !== 'Active') {
    const error = new Error('There is no active workday to close.');
    error.status = 409;
    throw error;
  }
  const endedAt = new Date(now).toISOString();
  workday.status = 'Closed';
  workday.endedAt = endedAt;
  workday.reflection = cleanText(input.reflection, 'End-of-day note', { max: 360 });
  workday.events ||= [];
  workday.events.unshift({ id: crypto.randomUUID(), at: endedAt, type: 'day_closed', label: 'Closed the workday' });
  return workday;
}
