import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './recording.css';
import './run-mode.css';
import './backoffice.css';
import './target-links.css';
import './backoffice-proof.css';
import './process-capture.css';
import './resume-tailor.css';
import './matchday-bot.css';
import './numbers-inspector.css';
import './job-journey.css';
import './sign-in.css';
import './review-notes.css';
import './numbers-research.css';
import './achilles-theme.css';
import './assistant.css';
import './workday.css';
import './run-proof.css';
import './run-proof-overrides.css';
import { OdysseyAssistant } from './odyssey-assistant.jsx';
import { WorkdayConsole } from './workday-console.jsx';

let authToken = localStorage.getItem('anukriti_session') || '';
const request = async (url, body, method) => {
  const response = await fetch(url, { method: method || (body === undefined ? 'GET' : 'POST'), cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

function SignIn({ onSignedIn }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    try {
      setError(''); setIsSubmitting(true);
      const result = await request(mode === 'signin' ? '/api/auth/login' : '/api/auth/register', form);
      authToken = result.token; localStorage.setItem('anukriti_session', result.token); onSignedIn(result.user);
    } catch (nextError) { setError(nextError.message); } finally { setIsSubmitting(false); }
  }
  const isSignIn = mode === 'signin';
  const changeMode = () => { setMode(isSignIn ? 'register' : 'signin'); setError(''); };
  return <><main className="authStadium">
    <div className="stadiumGlow stadiumGlowOne" aria-hidden="true" />
    <div className="stadiumGlow stadiumGlowTwo" aria-hidden="true" />
    <div className="pitchLines" aria-hidden="true" />
    <div className="authFrame">
      <section className="authWelcome" aria-labelledby="auth-title">
        <div className="authWordmark" aria-label="Chayya"><span className="authMark" aria-hidden="true" /><span>chayya</span></div>
        <p className="authKicker">THE SHADOW OF YOUR BEST WORK</p>
        <h1 id="auth-title">Turn one hard-won route into a trusted job.</h1>
        <p className="authLead">Record a browser task once, review its exact steps, and keep a reusable job with proof of every run.</p>
        <div className="authScoreboard" aria-label="Your first mission">
          <div className="scoreboardHeader"><span>THE FIRST VOYAGE</span><b>01</b></div>
          <ol>
            <li><span>01</span><div><b>Chart the route</b><small>Capture the visible steps you take.</small></div></li>
            <li><span>02</span><div><b>Inspect the log</b><small>See exactly what will run again.</small></div></li>
            <li><span>03</span><div><b>Keep the proof</b><small>Save a reusable, accountable job.</small></div></li>
          </ol>
        </div>
        <p className="authTrust"><span aria-hidden="true">✓</span> Your jobs are tied to your account, with an audit trail and sensitive values redacted from saved recordings.</p>
      </section>
      <section className="authCard" aria-labelledby="auth-form-title">
        <div className="authCardTop"><span className="authStatusDot" aria-hidden="true" /><span>SECURE WORKSPACE</span><span>LIVE</span></div>
        <p className="eyebrow">{isSignIn ? 'WELCOME BACK' : 'CREATE YOUR WORKSPACE'}</p>
        <h2 id="auth-form-title">{isSignIn ? 'Enter the workshop.' : 'Begin your first voyage.'}</h2>
        <p>{isSignIn ? 'Your saved jobs and run history are ready when you are.' : 'Create a secure account to keep your recordings and their run proof together.'}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <label>Name<input required autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ada Lovelace" disabled={isSubmitting}/></label>}
          <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" disabled={isSubmitting}/></label>
          <label>Password<input required type="password" autoComplete={isSignIn ? 'current-password' : 'new-password'} minLength="10" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 10 characters" disabled={isSubmitting}/></label>
          {error && <div className="authError" role="alert">{error}</div>}
          <button className="primary authSubmit" disabled={isSubmitting}>{isSubmitting ? 'Opening workspace…' : isSignIn ? 'Sign in to Chayya →' : 'Create secure account →'}</button>
          <button type="button" className="linkButton authSwitch" onClick={changeMode} disabled={isSubmitting}>{isSignIn ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
        </form>
        <p className="authCardFoot">Built for deliberate replays, never blind automation.</p>
      </section>
    </div>
  </main><OdysseyAssistant signedIn={false}/></>;
}

function Create({ onCreated, onStarterJobs, onControlledDemoJobs }) {
  const [form, setForm] = useState({ name: '', startUrl: '' });
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    try { setError(''); onCreated(await request('/api/workflows', { ...form, platform: 'browser' })); } catch (nextError) { setError(nextError.message); }
  }
  return <section className="create"><div><span className="eyebrow">THE SHADOW OF YOUR BEST WORK</span><h1>Do the hard work once.<br/>Reuse the trusted route.</h1><p>Record a browser task, review the exact captured steps in plain English, then save a safe optimized version to run again.</p><ol className="howItWorks"><li>Name the recurring browser job and its starting page.</li><li>Complete it once in the visible recorder browser.</li><li>Review every captured step and the transparent optimization result.</li><li>Approve and rerun the saved job whenever the work repeats.</li></ol></div><form onSubmit={submit}><label>What job should Chayya record?<input required placeholder="e.g. Download my weekly report" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/></label><label>Where should the recorder start? <small>Optional</small><input type="url" placeholder="https://app.example.com" value={form.startUrl} onChange={event => setForm({ ...form, startUrl: event.target.value })}/></label><div className="adapterNote">Available now: browser recording with Playwright. Sign in manually in the recorder; Chayya redacts recognised password and token values before saving code.</div>{error && <div className="error">{error}</div>}<button className="primary">Create browser job →</button><button type="button" className="linkButton" onClick={onControlledDemoJobs}>Add five stable demo jobs (recommended)</button><button type="button" className="linkButton" onClick={onStarterJobs}>Add four public-search starter jobs instead</button></form></section>;
}

function CapturedSteps({ workflow }) {
  const steps = workflow.recordedSteps?.length ? workflow.recordedSteps : workflow.steps;
  if (!steps?.length) return null;
  return <section className="stepsPanel"><header><div><span className="eyebrow">CAPTURE REVIEW</span><h2>Exact recorded steps</h2><p>These are the browser actions captured before any runnable-plan optimization.</p></div><span className="stepCount">{steps.length} steps</span></header><ol className="stepList">{steps.map(step => <li key={`${step.number}-${step.code}`}><span>{String(step.number).padStart(2, '0')}</span><div><b>{step.summary}</b><code>{step.code}</code></div>{step.requiresConfirmation && <em>Review required</em>}</li>)}</ol>{workflow.riskySteps?.length ? <div className="riskNote">This job includes {workflow.riskySteps.length} action{workflow.riskySteps.length === 1 ? '' : 's'} that may submit, send, purchase, delete, or transfer data. Every rerun requires your confirmation.</div> : null}</section>;
}

function SopRuleBook({ workflow, onDownload }) {
  const sop = workflow.sop;
  if (!workflow.recordingFile || workflow.status === 'Recording') return null;
  if (!sop) return <section className="sopRuleBook"><span className="eyebrow">SOP & RULE BOOK</span><h2>Rule book is being prepared.</h2><p>It appears automatically when Chayya finishes validating the completed recording.</p></section>;
  return <section className="sopRuleBook"><header><div><span className="eyebrow">SOP & RULE BOOK · AUTOMATIC</span><h2>Run the route with shared rules.</h2><p>Created from the exact redacted capture. It documents each action, its operating rule, waits, approval checkpoints, and saved business notes.</p></div><div className="sopActions"><span>Capture {sop.captureVersion} · revision {sop.revision}</span><button onClick={onDownload}>Download SOP & Rule Book (.md)</button></div></header><ol>{sop.steps.map(step => <li key={`${step.number}-${step.code}`}><span>{String(step.number).padStart(2, '0')}</span><div><b>{step.action}</b><p>{step.rule}</p>{step.waitAfter && <small>Wait {step.waitAfter.milliseconds / 1000}s before the next captured action.</small>}{step.requiresConfirmation && <em>Human approval required</em>}</div></li>)}</ol><div className="sopFooter"><div><b>Saved rules</b><p>{sop.reviewRules?.length ? sop.reviewRules.join(' ') : 'No additional business rules have been added.'}</p></div><div><b>Replay readiness</b><p>{sop.reliability?.ok ? 'Known selector-risk checks passed. A visible rehearsal is still required before a background run.' : 'Not replay-ready. Resolve the reliability findings before preparing a reusable job.'}</p></div></div></section>;
}

function MatchdayWaitCoach({ workflow, onConfigure }) {
  const steps = (workflow.recordedSteps?.length ? workflow.recordedSteps : workflow.steps || []).filter(step => !['popup', 'wait'].includes(step.kind));
  if (!steps.length) return null;
  const waitFor = stepNumber => workflow.waits?.find(wait => wait.afterStepNumber === stepNumber);
  return <section className="matchdayCoach"><div className="matchdayBot" aria-hidden="true"><span>🛡</span><i>⌛</i></div><header><span className="eyebrow">AEGIS GUIDE</span><h2>Should the browser pause before the next action?</h2><p>After each captured action, add a real Playwright pause if the next page, result, or popup needs time. The wait is shown in the generated code and can be removed before running.</p></header><div className="waitCards">{steps.map(step => { const wait = waitFor(step.number); return <article key={step.number}><span>AFTER STEP {String(step.number).padStart(2, '0')}</span><b>{step.summary}</b>{wait ? <p>✓ {wait.milliseconds / 1000}s pause selected</p> : <p>Aegis check: add a pause here?</p>}<div><button onClick={() => onConfigure(step.number, 1000)}>Add 1s wait</button><button onClick={() => onConfigure(step.number, 2000)}>Add 2s wait</button><button onClick={() => onConfigure(step.number, 3000)}>Add 3s wait</button>{wait && <button className="linkButton" onClick={() => onConfigure(step.number, 0)}>No wait</button>}</div></article>; })}</div></section>;
}

function LiveMatchdayCoach({ steps, waits, onConfigure }) {
  const actions = steps.filter(step => !['popup', 'wait'].includes(step.kind));
  const latest = actions.at(-1);
  const [selectedStepNumber, setSelectedStepNumber] = useState(latest?.number || null);
  useEffect(() => { setSelectedStepNumber(current => actions.some(step => step.number === current) ? current : latest?.number || null); }, [steps.length, latest?.number]);
  if (!actions.length) return <section className="matchdayCoach liveCoach liveWaitEmpty"><div className="matchdayBot" aria-hidden="true"><span>🛡</span><i>●</i></div><header><span className="eyebrow">AEGIS GUIDE · LIVE RECORDING</span><h2>Your live action rail is ready.</h2><p>Make the first click, keyboard entry, choice, or navigation in the recorder browser. It will appear here in about a second so you can place a pause before your next action.</p></header></section>;
  const selected = actions.find(step => step.number === selectedStepNumber) || latest;
  const selectedWait = waits?.find(wait => wait.afterStepNumber === selected.number);
  const actionKind = { navigate: 'Navigation', fill: 'Keyboard input', click: 'Click', select: 'Choice', check: 'Selection', action: 'Browser action' };
  return <section className="matchdayCoach liveCoach liveWaitStudio"><div className="matchdayBot" aria-hidden="true"><span>🛡</span><i>●</i></div><header><span className="eyebrow">AEGIS GUIDE · LIVE RECORDING</span><h2>Set a pause before your next action.</h2><p>These are the actions the recorder has already observed. Choose any click, keyboard entry, choice, or navigation below; the pause is saved now and inserted after that exact action when you close the recorder.</p></header><div className="liveWaitLayout"><ol className="liveActionRail" aria-label="Observed actions during this recording">{actions.map(step => <li key={step.number} className={selected.number === step.number ? 'selected' : ''}><button onClick={() => setSelectedStepNumber(step.number)} aria-pressed={selected.number === step.number}><span>{String(step.number).padStart(2, '0')}</span><div><small>{actionKind[step.kind] || 'Browser action'}</small><b>{step.summary}</b></div><em>{waits?.some(wait => wait.afterStepNumber === step.number) ? 'Pause set' : step.number === latest.number ? 'Latest' : 'Add pause'}</em></button></li>)}</ol><aside className="livePauseComposer" aria-label={`Pause settings after step ${selected.number}`}><span className="eyebrow">PAUSE AFTER STEP {String(selected.number).padStart(2, '0')}</span><b>{selected.summary}</b><p>A pause runs before the next recorded action. It never makes a decision or changes the captured task.</p><div>{[500, 1000, 2000, 3000].map(milliseconds => <button key={milliseconds} className={selectedWait?.milliseconds === milliseconds ? 'selected' : ''} onClick={() => onConfigure(selected.number, milliseconds)}>Add a {milliseconds / 1000}s pause after step {String(selected.number).padStart(2, '0')}</button>)}</div>{selectedWait ? <button className="linkButton removeLiveWait" onClick={() => onConfigure(selected.number, 0)}>Remove {selectedWait.milliseconds / 1000}s pause</button> : <small>Choose a pause only when the next page, result, or popup genuinely needs time.</small>}</aside></div></section>;
}

function OptimizationReview({ workflow }) {
  if (!workflow.optimization?.length) return null;
  const recordedCount = workflow.recordedSteps?.length || workflow.steps?.length || 0;
  const optimizedCount = workflow.optimizedSteps?.length || recordedCount;
  return <section className="optimization"><span className="eyebrow">JOB OPTIMIZATION</span><h2>What changed before saving</h2><p><b>Captured: {recordedCount} steps · Runnable plan: {optimizedCount} steps</b></p><ul>{workflow.optimization.map(note => <li key={note}>✓ {note}</li>)}</ul><p>The original recording and its steps remain visible. Chayya only removes identical consecutive navigation or form-entry actions; everything else stays exactly as captured.</p></section>;
}

function RecordingReliability({ workflow }) {
  const reliability = workflow.recordingReliability;
  if (!reliability) return null;
  return <section className={`recordingReliability ${reliability.ok ? 'passed' : 'needsWork'}`}><span className="eyebrow">REUSABILITY PREFLIGHT</span><h2>{reliability.ok ? 'This capture passed the repeatability check.' : 'This capture needs a safer step before it can become a job.'}</h2><p>{reliability.summary}</p>{reliability.issues?.length ? <ul>{reliability.issues.map(issue => <li key={issue.code}><b>{issue.message}</b><small>{issue.fix}</small></li>)}</ul> : <small>The exact original capture stays available for your review. This check only blocks known fragile patterns before a runnable job is saved.</small>}</section>;
}

function hasVisibleReplay(workflow) {
  const execution = workflow.execution;
  if (!execution?.scriptFingerprint) return false;
  return [workflow.lastRun, ...(workflow.runHistory || [])].filter(Boolean).some(run => run.status === 'Passed' && run.runMode === 'visible' && run.execution?.workflowVersion === execution.workflowVersion && run.execution?.scriptFingerprint === execution.scriptFingerprint);
}

function JobJourney({ workflow, hasRecording, isRecording, isReliable, onRecord, onPrepare, onFocusRun }) {
  const hasVisiblePass = hasVisibleReplay(workflow);
  const hasAnyPass = (workflow.runHistory || []).some(run => run.status === 'Passed') || workflow.lastRun?.status === 'Passed';
  const stages = [
    { key: 'define', mark: '01', label: 'Name the quest', detail: 'Job created', done: true },
    { key: 'capture', mark: '02', label: 'Capture', detail: isRecording ? 'Recorder is open' : hasRecording ? `${workflow.recordedSteps?.length || workflow.steps?.length || 0} exact steps saved` : 'Teach the job once', done: hasRecording },
    { key: 'safety', mark: '03', label: 'Aegis check', detail: !hasRecording ? 'Unlocks after capture' : isReliable ? 'Repeatability check passed' : 'Blocked: safer recording needed', done: hasRecording && isReliable, blocked: hasRecording && !isReliable },
    { key: 'rehearse', mark: '04', label: 'Visible voyage', detail: !workflow.script ? 'Unlocks after safety check' : hasVisiblePass ? 'Visible replay verified' : 'Watch the first replay', done: hasVisiblePass },
    { key: 'proof', mark: '05', label: 'Run & proof', detail: hasAnyPass ? 'Run result saved' : 'Unlocks after rehearsal', done: hasAnyPass }
  ];
  const next = stages.find(stage => !stage.done) || stages.at(-1);
  let action = null;
  if (!hasRecording && !isRecording) action = { label: 'Start recording →', onClick: onRecord };
  else if (hasRecording && !isReliable) action = { label: 'Record a safer version →', onClick: onRecord };
  else if (hasRecording && !workflow.script) action = { label: 'Prepare visible rehearsal →', onClick: onPrepare };
  else if (workflow.script && !hasVisiblePass) action = { label: 'Set up visible rehearsal →', onClick: () => onFocusRun('visible') };
  else if (workflow.script) action = { label: 'Set up trusted background run →', onClick: () => onFocusRun('background') };
  return <section className="jobJourney" aria-labelledby="job-journey-title"><header><div><span className="eyebrow">VOYAGE PROGRESS</span><h2 id="job-journey-title">Teach it once. Prove the route.</h2><p>{isRecording ? 'Complete the task in the recorder browser, then close it to save the capture.' : `${stages.filter(stage => stage.done).length} of ${stages.length} checkpoints earned from saved evidence.`}</p></div><div className={`journeyStatus ${next.blocked ? 'blocked' : ''}`}><b>{next.blocked ? 'Needs a safer recording' : next.done ? 'Voyage complete' : `Next: ${next.label}`}</b><small>{next.detail}</small></div></header><ol>{stages.map(stage => <li key={stage.key} className={`${stage.done ? 'done' : ''} ${stage.blocked ? 'blocked' : ''}`} aria-current={!stage.done && stage.key === next.key ? 'step' : undefined}><span>{stage.done ? '✓' : stage.blocked ? '!' : stage.mark}</span><div><b>{stage.label}</b><small>{stage.detail}</small></div></li>)}</ol><div className="journeyAction">{isRecording ? <span>Recorder open — return here after closing it.</span> : action && <button className="primary" onClick={action.onClick}>{action.label}</button>}<small>Progress is based on saved capture, safety evidence, and run history — never on clicks or guesses.</small></div></section>;
}

function suggestedRunMode(workflow) {
  return !workflow.lastRun || workflow.lastRun.status === 'Failed' ? 'visible' : 'background';
}

const formatRunTime = value => value ? new Date(value).toLocaleString() : 'Not recorded';
const formatRunDuration = milliseconds => Number.isFinite(milliseconds) ? `${(milliseconds / 1000).toFixed(1)}s` : '—';
const runModeName = mode => mode === 'visible' ? 'Visible browser' : 'Background';
const runStatusIcon = status => status === 'Passed' ? '✓' : status === 'Failed' ? '!' : '…';

function ExecutionProof({ run, onRehearse, onLoadTechnicalLog, technicalLog, loadingTechnicalLog }) {
  if (!run) return null;
  const running = run.status === 'Running';
  const proof = run.proof || {};
  const execution = run.execution || proof.execution || {};
  const log = technicalLog ?? run.technicalLog;
  const issue = proof.issue;
  return <section className={`runResult executionProof ${String(run.status || '').toLowerCase()}`} aria-live="polite" aria-label="Run result">
    <header>
      <span className={`runVerdict ${String(run.status || '').toLowerCase()}`} aria-hidden="true">{runStatusIcon(run.status)}</span>
      <div><span className="eyebrow">EXECUTION PROOF</span><h3>{running ? 'Saved browser job is running.' : proof.headline || (run.status === 'Passed' ? 'Saved browser checks passed.' : 'This replay needs attention.')}</h3></div>
      <b className={`runStatusBadge ${String(run.status || '').toLowerCase()}`}>{run.status} · {runModeName(run.runMode)}</b>
    </header>
    {running ? <p className="runningExplanation">{run.runMode === 'visible' ? 'A browser window is open on this Mac. Watch the rehearsal there; this card will update when it finishes.' : 'The saved job is running in the background. This card will update when it finishes.'} A run is stopped after two minutes to avoid an indefinite wait.</p> : <>
      <p className="runSummary">{proof.summary || 'The browser runner completed this saved job.'}</p>
      <dl className="runFacts">
        <div><dt>Replay</dt><dd>{runModeName(run.runMode)}</dd></div>
        <div><dt>Duration</dt><dd>{formatRunDuration(run.durationMs)}</dd></div>
        <div><dt>Saved version</dt><dd>v{execution.workflowVersion || '—'} · {execution.runnableStepCount ?? '—'} runnable steps</dd></div>
        <div><dt>Script proof</dt><dd>SHA-256 {execution.scriptFingerprint || '—'}</dd></div>
        <div><dt>Run proof</dt><dd title={run.id}>#{run.id?.slice(0, 8) || 'pending'}</dd></div>
      </dl>
      {proof.testCounts?.reported && <p className="runCheckCount">{proof.testCounts.passed} saved browser check{proof.testCounts.passed === 1 ? '' : 's'} passed{proof.testCounts.failed ? ` · ${proof.testCounts.failed} failed` : ''}.</p>}
      {issue && <div className="runIssue"><span>{issue.category}</span><b>{issue.message}</b>{issue.step && <small>Likely affected action: step {String(issue.step.number).padStart(2, '0')} — {issue.step.summary}</small>}<p>{proof.nextSafeAction}</p><button type="button" className="primary" onClick={onRehearse}>Rehearse visibly →</button></div>}
      {!issue && <p className="runBoundary">{proof.boundary}</p>}
      {!issue && <p className="runNextAction">{proof.nextSafeAction}</p>}
      <details className="technicalDetails" onToggle={event => { if (event.currentTarget.open && log === undefined && !loadingTechnicalLog) onLoadTechnicalLog(); }}>
        <summary>Technical details for troubleshooting</summary>
        <p>This sanitized diagnostic log is for troubleshooting; the result above is the user-facing proof.</p>
        {loadingTechnicalLog ? <span>Loading technical details…</span> : log ? <><pre>{log}</pre><button type="button" onClick={() => navigator.clipboard?.writeText(log)}>Copy technical details</button></> : <button type="button" onClick={onLoadTechnicalLog}>Load technical details</button>}
      </details>
    </>}
  </section>;
}

function Workflow({ workflow, onChange }) {
  const [current, setCurrent] = useState(workflow);
  const [feedback, setFeedback] = useState('');
  const [notice, setNotice] = useState('');
  const [script, setScript] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [runConfirmed, setRunConfirmed] = useState(false);
  const [startingRun, setStartingRun] = useState(false);
  const [technicalLog, setTechnicalLog] = useState(undefined);
  const [loadingTechnicalLog, setLoadingTechnicalLog] = useState(false);
  const [runMode, setRunMode] = useState(() => suggestedRunMode(workflow));
  const [liveSteps, setLiveSteps] = useState([]);
  const [noteNeedsCodeUpdate, setNoteNeedsCodeUpdate] = useState(false);
  const recordingRequestVersion = useRef(0);

  useEffect(() => {
    setCurrent(workflow);
    setRunMode(hasVisibleReplay(workflow) ? suggestedRunMode(workflow) : 'visible');
    setRunConfirmed(false);
    setNoteNeedsCodeUpdate(false);
    setTechnicalLog(undefined);
  }, [workflow.id]);

  const refreshList = async () => { await onChange(); };
  const hasRecording = Boolean(current.recordingFile) && ['Recorded', 'Ready to run'].includes(current.status);
  const isRecording = current.status === 'Recording';
  const canRun = Boolean(current.script) && !isRecording;
  const isReliable = current.recordingReliability?.ok !== false;
  const isRunning = current.lastRun?.status === 'Running';
  const runBusy = isRunning || startingRun;
  const hasVisiblePass = hasVisibleReplay(current);
  const selectRunMode = mode => { setRunMode(mode); setRunConfirmed(false); };

  async function checkRecording() {
    const requestVersion = ++recordingRequestVersion.current;
    try {
      const result = await request(`/api/workflows/${current.id}/recording`);
      if (requestVersion !== recordingRequestVersion.current) return;
      setCurrent(result.workflow);
      if (result.workflow.status === 'Recording') setLiveSteps(result.steps || []);
      if (result.ready && result.workflow.status !== 'Recording') {
        setScript(result.code);
        setNotice(result.reliability?.ok === false ? 'Recording saved, but it needs a safer selector before it can become a reusable job.' : `Recording saved: ${result.steps.length} exact browser steps are ready for review.`);
      } else if (result.workflow.recordingError) {
        setNotice(result.workflow.recordingError);
      } else {
        setNotice('Still waiting. Complete the job in the recorder browser, then close that browser.');
      }
      if (result.workflow.status !== 'Recording') await refreshList();
    } catch (error) { setNotice(error.message); }
  }

  useEffect(() => {
    if (!isRecording) return undefined;
    checkRecording();
    const timer = window.setInterval(checkRecording, 1000);
    return () => window.clearInterval(timer);
  }, [current.id, isRecording]);

  useEffect(() => { if (!isRecording) setLiveSteps([]); }, [isRecording]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const checkRun = async () => {
      try {
        const result = await request(`/api/workflows/${current.id}/run`);
        setCurrent(result.workflow);
        if (result.lastRun?.status !== 'Running') {
          const mode = runModeName(result.lastRun?.runMode);
          setNotice(result.lastRun?.status === 'Passed' ? `${mode} replay finished. Read the execution proof below.` : `${mode} replay needs attention. The recovery step is shown below.`);
          if (result.lastRun?.status === 'Failed') selectRunMode('visible');
        }
        await refreshList();
      } catch (error) { setNotice(error.message); }
    };
    checkRun();
    const timer = window.setInterval(checkRun, 1500);
    return () => window.clearInterval(timer);
  }, [current.id, isRunning]);

  async function startRecording() {
    try {
      const result = await request(`/api/workflows/${current.id}/record`, {});
      setCurrent(result.workflow); setLiveSteps([]); setScript(''); setScriptUrl(''); setNotice(result.message); await refreshList();
    } catch (error) { setNotice(error.message); }
  }
  async function saveFeedback() {
    if (!feedback.trim()) return;
    try {
      const result = await request(`/api/workflows/${current.id}/feedback`, { feedback });
      setCurrent(result.workflow); setFeedback(''); setScript(''); setScriptUrl(''); setNoteNeedsCodeUpdate(Boolean(result.requiresRebuild));
      setNotice(result.requiresRebuild ? 'Note saved to this job. Update the saved code to include it.' : `Saved review note: ${result.learned.join(', ')}.`); await refreshList();
    } catch (error) { setNotice(error.message); }
  }
  async function configureWait(afterStepNumber, milliseconds) {
    try {
      const result = await request(`/api/workflows/${current.id}/waits`, { afterStepNumber, milliseconds }); setCurrent(result.workflow); setScript(''); setScriptUrl('');
      setNotice(milliseconds ? `Aegis Guide added a ${milliseconds / 1000}s wait after step ${afterStepNumber}. Review & optimize to rebuild the runnable job.` : `Aegis Guide removed the wait after step ${afterStepNumber}.`); await refreshList();
    } catch (error) { setNotice(error.message); }
  }
  async function queueLiveWait(afterStepNumber, milliseconds) {
    try {
      const result = await request(`/api/workflows/${current.id}/recording/waits`, { afterStepNumber, milliseconds }); setCurrent(result.workflow); setLiveSteps(result.liveSteps || liveSteps);
      setNotice(milliseconds ? `Aegis Guide queued a ${milliseconds / 1000}s wait after observed step ${afterStepNumber}. Keep recording, then close the recorder to save it.` : `Aegis Guide removed the queued wait after step ${afterStepNumber}.`); await refreshList();
    } catch (error) { setNotice(error.message); }
  }
  async function prepareCode() {
    try {
      recordingRequestVersion.current += 1;
      const result = await request(`/api/workflows/${current.id}/generate`, {});
      setCurrent(result.workflow); setScript(result.code); setScriptUrl(result.url);
      setNoteNeedsCodeUpdate(false);
      setNotice(`Reusable job prepared with ${result.optimization.length} optimization result${result.optimization.length === 1 ? '' : 's'}.`);
      await refreshList();
    } catch (error) { setNotice(error.message); }
  }
  function focusRunPanel(mode) {
    selectRunMode(mode);
    setNotice(mode === 'visible' ? 'Visible rehearsal selected. Review the confirmation below, then watch the saved job run.' : 'Trusted background run selected. Review the confirmation below before running.');
    document.getElementById('run-saved-job')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function runCode() {
    try {
      setStartingRun(true); setRunConfirmed(false); setTechnicalLog(undefined);
      const result = await request(`/api/workflows/${current.id}/run`, { confirmed: runConfirmed, runMode });
      setCurrent(result.workflow); setNotice(result.message); await refreshList();
    } catch (error) { setNotice(error.message); } finally { setStartingRun(false); }
  }
  async function loadTechnicalLog() {
    if (!current.lastRun?.id || loadingTechnicalLog) return;
    try { setLoadingTechnicalLog(true); const result = await request(`/api/workflows/${current.id}/runs/${current.lastRun.id}/log`); setTechnicalLog(result.log || 'No technical output was captured for this run.'); } catch (error) { setNotice(error.message); } finally { setLoadingTechnicalLog(false); }
  }
  async function downloadScript() {
    try {
      const response = await fetch(scriptUrl, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error('Unable to download the saved job.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = objectUrl; link.download = current.script || 'chayya-job.spec.js'; link.click(); URL.revokeObjectURL(objectUrl);
    } catch (error) { setNotice(error.message); }
  }
  async function downloadSop() {
    try {
      const response = await fetch(`/api/workflows/${current.id}/sop`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error('Unable to download the saved SOP and Rule Book.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = objectUrl; link.download = current.sop?.filename || 'chayya-sop-rule-book.md'; link.click(); URL.revokeObjectURL(objectUrl);
    } catch (error) { setNotice(error.message); }
  }
  async function duplicate() { try { const copy = await request(`/api/workflows/${current.id}/duplicate`, {}); setNotice(`Created “${copy.name}”.`); await refreshList(); } catch (error) { setNotice(error.message); } }
  async function remove() { if (!window.confirm(`Delete “${current.name}”? This removes its saved job from Chayya.`)) return; try { await request(`/api/workflows/${current.id}`, undefined, 'DELETE'); setNotice('Job deleted.'); await refreshList(); window.location.hash = 'library'; } catch (error) { setNotice(error.message); } }

  return <main>
    <div className="back">BROWSER JOBS / {current.name.toUpperCase()}</div>
    <section className="workflowHead">
      <div><span className={`status ${current.status.replaceAll(' ', '')}`}>{current.status}</span><h1>{current.name}</h1><p>{current.startUrl ? `Recorder starts at ${current.startUrl}` : 'The recorder opens a browser; navigate to the job when it appears.'} · Version {current.version || 1}</p></div>
      <div className="workflowActions"><button className="primary" onClick={startRecording} disabled={isRecording}>● {isRecording ? 'Recorder open' : 'Record this job'}</button><button onClick={prepareCode} disabled={!hasRecording || !isReliable}>Review & optimize</button><button onClick={duplicate}>Duplicate</button><button className="danger" onClick={remove}>Delete</button></div>
    </section>
    {notice && <div className="notice">✦ {notice}</div>}
    {current.source && <div className="adapterNote">{current.source}: this job is a resilient, reusable search template rather than a recording of your personal clicks. Re-record it anytime to tailor it.</div>}
    <JobJourney workflow={current} hasRecording={hasRecording} isRecording={isRecording} isReliable={isReliable} onRecord={startRecording} onPrepare={prepareCode} onFocusRun={focusRunPanel}/>
    {isRecording && <LiveMatchdayCoach steps={liveSteps} waits={current.pendingWaits || []} onConfigure={queueLiveWait}/>} 
    {current.redactedSecrets ? <div className="riskNote">{current.redactedSecrets} sensitive value{current.redactedSecrets === 1 ? '' : 's'} was redacted. Provide the matching secure runtime variable before running this job.</div> : null}
    <CapturedSteps workflow={current}/>
    <SopRuleBook workflow={current} onDownload={downloadSop}/>
    <RecordingReliability workflow={current}/>
    <MatchdayWaitCoach workflow={current} onConfigure={configureWait}/>
    <OptimizationReview workflow={current}/>
    <section className="rules"><div><h2>Review notes</h2><p>Describe guardrails or business context. Notes remain visible in the saved code for a person to review; they never silently change the captured process.</p><div className="feedback"><textarea value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="e.g. Ask before submitting the final report."/><button onClick={saveFeedback} disabled={!feedback.trim()}>Save note</button></div>{current.rules?.length ? <ul>{current.rules.map(rule => <li key={rule}>✓ {rule}</li>)}</ul> : null}{noteNeedsCodeUpdate && <div className="noteCodeUpdate" role="status"><div><b>Note saved to this job.</b><span>Rebuild the saved code before running so this version includes your note.</span></div><button className="primary" onClick={prepareCode} disabled={!hasRecording || !isReliable}>Update saved job code →</button></div>}</div><div><h2>Job status</h2><p><b>{noteNeedsCodeUpdate ? 'Saved code needs an update' : isRecording ? 'Waiting for recorder to close' : hasRecording ? 'Exact steps saved' : 'Not recorded yet'}</b></p><small>{noteNeedsCodeUpdate ? 'Your note is safe in this job. Update the code once to make this version ready to run.' : 'Only browser recording is available in this version. Desktop and mobile jobs are not presented as working features.'}</small></div></section>
    {canRun && <section className="runPanel" id="run-saved-job">
      <div>
        <span className="eyebrow">RUN SAVED JOB</span>
        <h2>Choose how you want to run it.</h2>
        <p>A visible run opens a browser window on this computer so you can watch. A background run is for a repeat job you have already reviewed. Chayya cannot safely embed third-party sites such as Bing, Amazon, or eBay inside this page.</p>
        <fieldset className="runModes" aria-describedby="run-mode-help">
          <legend>Browser visibility</legend>
          <label className={`runMode ${runMode === 'visible' ? 'selected' : ''}`}><input type="radio" name="run-mode" value="visible" checked={runMode === 'visible'} onChange={() => selectRunMode('visible')}/><span><b>Visible browser</b><small>Recommended for a first run or after a failure. Watch every step in a local browser window.</small></span></label>
          <label className={`runMode ${runMode === 'background' ? 'selected' : ''} ${!hasVisiblePass ? 'locked' : ''}`}><input type="radio" name="run-mode" value="background" checked={runMode === 'background'} onChange={() => selectRunMode('background')} disabled={!hasVisiblePass}/><span><b>Background</b><small>{hasVisiblePass ? `Runs without opening a window. This exact version passed a visible rehearsal.` : 'Unlocks only after this exact saved version passes visibly.'}</small></span></label>
        </fieldset>
        <p id="run-mode-help" className="runModeHelp">The selected mode is saved with the run result and audit trail.</p>
        <label className="confirm"><input type="checkbox" checked={runConfirmed} onChange={event => setRunConfirmed(event.target.checked)}/> I reviewed this job and want to run it.</label>
        <button className="primary" onClick={runCode} disabled={!runConfirmed || runBusy}>{runBusy ? 'Running saved job…' : runMode === 'visible' ? 'Open visible browser →' : 'Run in background →'}</button>
      </div>
      <ExecutionProof run={current.lastRun} onRehearse={() => focusRunPanel('visible')} onLoadTechnicalLog={loadTechnicalLog} technicalLog={technicalLog} loadingTechnicalLog={loadingTechnicalLog}/>
    </section>}
    {current.lastRun?.status === 'Passed' && <section className="runWin"><span aria-hidden="true">✓</span><div><b>{hasVisiblePass ? 'Reusable job ready' : 'Replay passed'}</b><p>{current.lastRun.runMode === 'visible' ? 'Visible rehearsal passed. You can now run this reviewed job in the background when you need it.' : 'The saved job passed again and its proof remains in run history.'}</p></div><button onClick={() => focusRunPanel(hasVisiblePass ? 'background' : 'visible')}>{hasVisiblePass ? 'Run again in background →' : 'Rehearse visibly again →'}</button></section>}
    {current.runHistory?.length > 1 && <section className="optimization runHistory"><span className="eyebrow">RUN HISTORY</span><h2>Recent outcomes</h2><ul>{current.runHistory.map(run => <li key={run.id} className={String(run.status || '').toLowerCase()}><span aria-hidden="true">{runStatusIcon(run.status)}</span><div><b>{run.status} · {runModeName(run.runMode)} · v{run.execution?.workflowVersion || '—'}</b><small>{run.proof?.summary || 'Run evidence was recorded.'}</small><em>{formatRunTime(run.completedAt || run.startedAt)} · {formatRunDuration(run.durationMs)}</em></div></li>)}</ul></section>}
    {script && <section className="code"><header><span>{scriptUrl ? 'OPTIMIZED, RUNNABLE PLAYWRIGHT CODE' : 'SAVED EXACT PLAYWRIGHT RECORDING'}</span><div>{scriptUrl && <button onClick={downloadScript}>Download</button>}<button onClick={() => navigator.clipboard.writeText(script)}>Copy</button></div></header><pre>{script}</pre></section>}
  </main>;
}

const displayCurrency = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

function BackOfficeDemo({ user }) {
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const canRun = ['admin', 'creator', 'runner'].includes(user.role);
  const load = async () => { try { setData(await request('/api/backoffice/demo')); } catch (error) { setNotice(error.message); } };
  useEffect(() => { load(); }, []);
  const queue = data?.queue;
  const job = data?.latestJob;
  const processJob = data?.latestProcessJob;
  const isRouting = job?.status === 'Running';
  useEffect(() => {
    if (!isRouting) return undefined;
    const timer = window.setInterval(load, 500);
    return () => window.clearInterval(timer);
  }, [job?.id, isRouting]);
  useEffect(() => {
    if (job?.status === 'Completed' && data?.latestRun?.jobId === job.id) setNotice(`Proof complete: ${data.latestRun.analytics.passed} records loaded to FinanceHub and ${data.latestRun.analytics.failed} routed to ExceptionDesk.`);
    if (job?.status === 'Failed') setNotice(`Background routing failed: ${job.error}`);
  }, [job?.id, job?.status, data?.latestRun?.id]);
  const queueRecords = async () => {
    try { setBusy(true); setNotice(''); const result = await request('/api/backoffice/demo/queue', {}); setData(result); setNotice(`${result.queue.source.recordCount} records loaded into queue ${result.queue.id.slice(0, 8)}.`); }
    catch (error) { setNotice(error.message); } finally { setBusy(false); }
  };
  const startBackgroundRouting = async () => {
    try { setBusy(true); setNotice(''); const result = await request('/api/backoffice/demo/run', {}); setData(result); setNotice('Background routing started. The server worker is applying the documented rules—no browser window is required.'); }
    catch (error) { setNotice(error.message); } finally { setBusy(false); }
  };
  const captureProcess = async () => {
    try { setBusy(true); setNotice(''); const result = await request('/api/backoffice/demo/process-jobs/record', {}); setData(result); setNotice('Business process captured. Review the exact stages before saving its optimized execution plan.'); }
    catch (error) { setNotice(error.message); } finally { setBusy(false); }
  };
  const optimizeProcess = async () => {
    if (!processJob) return;
    try { setBusy(true); setNotice(''); const result = await request(`/api/backoffice/demo/process-jobs/${processJob.id}/optimize`, {}); setData(result); setNotice('Optimized execution plan saved. It will create a fresh queue and run safely in the background.'); }
    catch (error) { setNotice(error.message); } finally { setBusy(false); }
  };
  const runSavedProcess = async () => {
    if (!processJob) return;
    try { setBusy(true); setNotice(''); const result = await request(`/api/backoffice/demo/process-jobs/${processJob.id}/run`, {}); setData(result); setNotice('Saved job started: a fresh source queue is now being routed by the background worker.'); }
    catch (error) { setNotice(error.message); } finally { setBusy(false); }
  };
  const downloadArtifact = async type => {
    const latest = data?.latestRun; if (!latest) return;
    try {
      const suffix = type === 'proof' ? 'proof' : 'approved-workbook'; const filename = type === 'proof' ? 'backoffice-proof.json' : 'financehub-approved-invoices.xlsx';
      const response = await fetch(`/api/backoffice/demo/runs/${latest.id}/${suffix}`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error(`The ${type === 'proof' ? 'proof report' : 'FinanceHub mapping workbook'} could not be downloaded.`);
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
    } catch (error) { setNotice(error.message); }
  };
  const latest = data?.latestRun;
  const sourceInvoices = data?.source?.invoices || [];
  const decisions = latest?.decisions || [];
  const analytics = latest?.analytics;
  return <main className="backOffice">
    <div className="back">WORK AND PRODUCTIVITY / BACK-OFFICE AUTOMATION</div>
    <section className="backOfficeHero">
      <div><span className="eyebrow">SAVED SAMPLE JOB · QUEUE → RULES → BACKGROUND ROUTING → PROOF</span><h1>Route invoices before a team touches them.</h1><p>Load ten source invoices into a durable queue. The server worker applies the rules in a business-readable document, reads internal Excel mapping, and routes results in the background with proof.</p><div className="heroActions"><button className="primary" onClick={queueRecords} disabled={!canRun || busy || isRouting || queue?.status === 'Queued'}>{queue?.status === 'Queued' ? '10 records queued' : '1. Load 10 records into queue →'}</button><button onClick={startBackgroundRouting} disabled={!canRun || busy || isRouting || queue?.status !== 'Queued'}>{isRouting ? 'Background routing in progress…' : '2. Run background routing →'}</button><a href={data?.source?.url || '/demo-websites/acme-invoices.html'} target="_blank" rel="noreferrer">Open Website 1: ACME source ↗</a></div>{!canRun && <p className="roleNote">Your {user.role} role can view this demo but cannot run it.</p>}</div>
      <aside><span>BUSINESS OUTCOME</span><b>{isRouting ? 'Routing safely in background' : analytics ? `${analytics.passed} invoices posted automatically` : 'Queue is ready for 10 invoices'}</b><p>{analytics ? `${analytics.failed} exceptions were safely routed for review.` : 'The full proof appears after the worker completes.'}</p><small>No live finance system is contacted. Website 2 and Website 3 are durable local demo targets.</small></aside>
    </section>
    {notice && <div className="notice">✦ {notice}</div>}
    <section className="processCapture">
      <header><div><span className="eyebrow">RECORD → REVIEW → SAVE → RUN</span><h2>Capture this business process as a reusable job.</h2><p>This records the business steps and rules evidence visible in this app; its optimized rerun uses the background worker instead of replaying fragile browser clicks.</p></div><span className={`processStatus ${processJob?.status?.replaceAll(' ', '-') || 'not-recorded'}`}>{processJob?.status || 'Not recorded'}</span></header>
      {!processJob ? <div className="processStart"><div><b>Intent-aware capture</b><p>Recognises the declared source table, queue, versioned rules document, background worker, controlled targets, and proof chain.</p></div><button className="primary" onClick={captureProcess} disabled={!canRun || busy || isRouting}>Capture this process as a reusable job →</button></div> : <>
        <div className="intentCard"><div><span>STRUCTURED INTENT</span><b>{processJob.intent.label}</b><small>{processJob.intent.summary}</small></div><div><span>METHOD</span><b>Local, transparent classification</b><small>{processJob.intent.confidence}% confidence · {processJob.intent.matchedStages.length} matching stages</small></div><div><span>CAPTURED</span><b>{new Date(processJob.capturedAt).toLocaleString()}</b><small>{processJob.capture.rules.document} v{processJob.capture.rules.version}</small></div></div>
        <div className="processPlans"><div><span className="eyebrow">EXACT CAPTURE</span><h3>Business steps retained for audit</h3><ol>{processJob.rawPlan.map(step => <li key={`${processJob.id}-raw-${step.number}`}><b>{String(step.number).padStart(2, '0')} · {step.stage}</b><span>{step.summary}</span><small>{step.evidence}</small></li>)}</ol></div>{processJob.optimizedPlan && <div><span className="eyebrow">SAVED OPTIMIZED PLAN</span><h3>Execution steps for each rerun</h3><ol>{processJob.optimizedPlan.map(step => <li key={`${processJob.id}-optimized-${step.number}`}><b>{String(step.number).padStart(2, '0')} · {step.stage}</b><span>{step.summary}</span></li>)}</ol></div>}</div>
        {processJob.optimization?.length > 0 && <div className="processOptimization"><b>What was improved safely</b><ul>{processJob.optimization.map(note => <li key={note}>✓ {note}</li>)}</ul></div>}
        <div className="processActions">{processJob.status === 'Recorded' && <button className="primary" onClick={optimizeProcess} disabled={!canRun || busy || isRouting}>Review & optimize saved process →</button>}{processJob.status === 'Ready to run' && <button className="primary" onClick={runSavedProcess} disabled={!canRun || busy || isRouting}>Run optimized saved job →</button>}{processJob.status === 'Running' && <b>Background worker is routing this saved job…</b>}{processJob.lastExecution && <small>Latest execution: {processJob.lastExecution.status} · {processJob.lastExecution.runId ? `proof run ${processJob.lastExecution.runId.slice(0, 8)}` : `job ${processJob.lastExecution.jobId.slice(0, 8)}`}</small>}</div>
      </>}
      {!canRun && <p className="roleNote">Your {user.role} role can review the saved process but cannot capture, optimize, or run it.</p>}
    </section>
    <section className="backOfficeFlow">
      <article><span>01 · INPUT QUEUE</span><h2>Load source records</h2><p>Website 1 is parsed once and a fingerprinted batch is queued for the worker.</p><b>{queue ? `${queue.source.recordCount} records · ${queue.status}` : `${sourceInvoices.length || 10} available records`}</b></article>
      <article><span>02 · RULES DOCUMENT</span><h2>Apply approved logic</h2><p>Business rules live in <b>{data?.rules?.document || 'BACKOFFICE_RULES.md'}</b>, then execute in code with a clear version.</p><b>{data?.rules ? `v${data.rules.version} · ${data.rules.ruleSet}` : 'Loading rules…'}</b></article>
      <article><span>03 · BACKGROUND WORKER</span><h2>Route without a browser</h2><p>The server worker reads Excel mappings and routes approved records or exceptions without replaying fragile UI clicks.</p><b>{isRouting ? 'Worker running' : job?.status || 'Waiting for queue'}</b></article>
      <article><span>04 · PROOF</span><h2>Show concrete evidence</h2><p>Keep timestamps, rule version, hashes, mapping count, outcome totals, target queues, and a downloadable report.</p><b>{latest ? 'Proof report ready' : 'Proof appears after completion'}</b></article>
    </section>
    <section className="proofPanel"><header><div><span className="eyebrow">RUN PROOF / AUDIT EVIDENCE</span><h2>{latest ? 'This run can be independently checked.' : 'The proof chain will appear here.'}</h2></div>{latest && <div><button onClick={() => downloadArtifact('proof')}>Download proof report</button><button onClick={() => downloadArtifact('workbook')}>Download mapped Excel</button></div>}</header><div className="proofSteps"><div><span>Queue</span><b>{queue ? `${queue.source.recordCount} records · ${queue.status}` : 'Not loaded'}</b><small>{queue?.source?.fingerprint ? `Source hash ${queue.source.fingerprint}` : 'Load a source batch to create a fingerprint.'}</small></div><div><span>Rules</span><b>{data?.rules ? `${data.rules.document} v${data.rules.version}` : 'Not loaded'}</b><small>{data?.rules?.fingerprint ? `Rules hash ${data.rules.fingerprint}` : 'Rules are read before routing.'}</small></div><div><span>Worker</span><b>{job?.status || 'Not started'}</b><small>{job?.startedAt ? new Date(job.startedAt).toLocaleString() : 'Starts after a queue is available.'}</small></div><div><span>Proof</span><b>{latest ? `${latest.proof.mappingRows} Excel mappings used` : 'Pending'}</b><small>{latest?.proof?.sourceFingerprint ? `Run hash ${latest.proof.sourceFingerprint}` : 'Completion evidence appears here.'}</small></div></div>{latest?.proof?.events && <ol className="proofTimeline">{latest.proof.events.map(event => <li key={event}>✓ {event}</li>)}</ol>}</section>
    <section className="analyticsPanel">
      <header><div><span className="eyebrow">FREE BUILT-IN ANALYTICS</span><h2>Automation throughput</h2><p>{analytics ? `Latest completed run: ${new Date(latest.completedAt).toLocaleString()} · ${latest.durationMs} ms background worker time.` : 'Complete the queued job to calculate the live demo metrics.'}</p></div></header>
      <div className="metricGrid"><div><span>Invoices read</span><b>{analytics?.total ?? sourceInvoices.length ?? 10}</b></div><div><span>Passed to FinanceHub</span><b>{analytics?.passed ?? 0}</b></div><div><span>Exceptions routed</span><b>{analytics?.failed ?? 0}</b></div><div><span>Pass rate</span><b>{analytics ? `${analytics.passRate}%` : '—'}</b></div></div>
      {analytics && <div className="throughputBars"><div><span>Passed · {displayCurrency(analytics.approvedAmount)}</span><i><b style={{ width: `${analytics.passRate}%` }}/></i></div><div><span>Exceptions · {displayCurrency(analytics.exceptionAmount)}</span><i><b className="exceptionBar" style={{ width: `${100 - analytics.passRate}%` }}/></i></div></div>}
    </section>
    <section className="decisionPanel"><header><div><span className="eyebrow">DECISION LOG</span><h2>{latest ? 'Every invoice has a clear outcome.' : 'Queue the source, then start the background worker.'}</h2></div><small>{latest?.decisionEngine?.label || 'No decision has been run yet.'}</small></header>{decisions.length ? <div className="dataTableWrap"><table><thead><tr><th>Invoice</th><th>Supplier</th><th>Amount</th><th>Decision</th><th>Reason / target</th></tr></thead><tbody>{decisions.map(decision => <tr key={decision.invoiceId}><td>{decision.invoiceId}</td><td>{decision.supplier}</td><td>{displayCurrency(decision.amount)}</td><td><span className={`decision ${decision.status}`}>{decision.status} · {decision.confidence}%</span></td><td>{decision.reasons.join('; ')}<small>{decision.target}</small></td></tr>)}</tbody></table></div> : <div className="sourcePreview">{sourceInvoices.map(invoice => <span key={invoice.invoiceId}>{invoice.invoiceId} · {invoice.supplier} · {displayCurrency(invoice.amount)}</span>)}</div>}</section>
    {latest && <section className="targetGrid"><article><span className="eyebrow">WEBSITE 2 · FINANCEHUB</span><h2>{data.financeHub.length} mapped invoice{data.financeHub.length === 1 ? '' : 's'} loaded</h2><p>Excel mapping adds ERP vendor, legal entity, and cost center before the simulated load.</p><a className="targetLink" href="/demo-websites/financehub.html" target="_blank" rel="noreferrer">Open FinanceHub target ↗</a><ul>{data.financeHub.slice(0, 5).map(record => <li key={record.id}><b>{record.invoiceId}</b> → {record.vendorId} · {record.legalEntity} · {record.costCenter}</li>)}</ul></article><article><span className="eyebrow">WEBSITE 3 · EXCEPTIONDESK</span><h2>{data.exceptionDesk.length} exception{data.exceptionDesk.length === 1 ? '' : 's'} awaiting review</h2><p>Nothing is discarded: the team sees exactly why a record needs a person.</p><a className="targetLink exceptionLink" href="/demo-websites/exceptiondesk.html" target="_blank" rel="noreferrer">Open ExceptionDesk target ↗</a><ul>{data.exceptionDesk.slice(0, 5).map(record => <li key={record.id}><b>{record.invoiceId}</b> → {record.reasons.join('; ')}</li>)}</ul></article></section>}
  </main>;
}

function ResumeTailor({ user }) {
  const [file, setFile] = useState(null); const [jobDescription, setJobDescription] = useState(''); const [job, setJob] = useState(null); const [notice, setNotice] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [selected, setSelected] = useState([]);
  const canEdit = ['admin', 'creator'].includes(user.role);
  async function analyze(event) {
    event.preventDefault(); if (!file) { setError('Choose your existing .docx, .txt, or .md resume first.'); return; }
    try {
      setBusy(true); setError(''); setNotice(''); const body = new FormData(); body.append('resume', file); body.append('jobDescription', jobDescription);
      const response = await fetch('/api/resume/jobs/analyze', { method: 'POST', headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) }, body }); const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The resume could not be analyzed.');
      setJob(result.job); setSelected(result.job.suggestions.filter(item => item.kind === 'surface').map(item => item.id)); setNotice('Alignment review ready. Select only the notes you want included in the separate Word review copy.');
    } catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  }
  const toggle = id => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  async function exportReview() {
    if (!job) return;
    try { setBusy(true); setError(''); const result = await request(`/api/resume/jobs/${job.id}/export`, { selectedSuggestionIds: selected }); setJob(result.job); setNotice('Word-compatible review copy generated. The original resume file has not been modified.'); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  }
  async function download(url, filename) {
    try { const response = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } }); if (!response.ok) throw new Error('The requested local artifact is unavailable.'); const objectUrl = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = objectUrl; link.download = filename; link.click(); URL.revokeObjectURL(objectUrl); }
    catch (nextError) { setError(nextError.message); }
  }
  async function clearJob() {
    if (!job || !window.confirm('Delete this local resume analysis and all Word review copies?')) return;
    try { await request(`/api/resume/jobs/${job.id}`, undefined, 'DELETE'); setJob(null); setSelected([]); setNotice('Local resume analysis and generated review copies were deleted.'); } catch (nextError) { setError(nextError.message); }
  }
  const latestExport = job?.exports?.[0];
  return <main className="resumeTailor"><div className="back">LOCAL PRODUCTIVITY / RESUME ALIGNMENT</div><section className="resumeHero"><div><span className="eyebrow">PRIVATE · REVIEWABLE · WORD-COMPATIBLE</span><h1>Align your resume<br/>without inventing it.</h1><p>Use your existing resume and a job description to find evidence, gaps, and safe review notes. The original file is never overwritten; the app generates a separate Word review copy that you control.</p></div><aside><b>Local only</b><p>Your resume and job description are processed by this local app. No OpenAI API call or cloud model is used.</p><small>Supports text-based .docx, .txt, and .md files up to 2 MB.</small></aside></section><section className="resumeForm"><header><span className="eyebrow">1. INPUTS</span><h2>Choose the existing resume and paste the JD.</h2></header><form onSubmit={analyze}><label>Existing resume<input type="file" accept=".docx,.txt,.md,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => setFile(event.target.files?.[0] || null)} disabled={!canEdit}/><small>{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : 'The original file remains unchanged.'}</small></label><label>Job description<textarea required minLength="40" value={jobDescription} onChange={event => setJobDescription(event.target.value)} placeholder="Paste the responsibilities, qualifications, and preferred skills…" disabled={!canEdit}/></label>{error && <div className="error">{error}</div>}<button className="primary" disabled={!canEdit || busy}>{busy ? 'Comparing locally…' : 'Analyze alignment →'}</button>{!canEdit && <p className="roleNote">Your {user.role} role can view the app but cannot process or export a resume.</p>}</form></section>{notice && <div className="notice">✦ {notice}</div>}{job && <><section className="resumeIntent"><div><span>STRUCTURED INTENT</span><b>{job.intent.label}</b><small>{job.intent.confidence}% schema match · local comparison</small></div><div><span>INPUT PROOF</span><b>{job.input.resume.fileName}</b><small>Resume hash {job.input.resume.sha256.slice(0, 12)} · JD hash {job.input.jobDescriptionHash.slice(0, 12)}</small></div><div><span>OUTCOME</span><b>{job.summary.evidenced} evidenced / {job.summary.notEvidenced} to review</b><small>Nothing is asserted without evidence.</small></div></section><section className="resumeMatrix"><header><div><span className="eyebrow">2. EVIDENCE MATRIX</span><h2>See what is present before changing anything.</h2><p>“Not evidenced” means this text was not found—not that you lack the skill or experience.</p></div></header><div className="dataTableWrap"><table><thead><tr><th>JD requirement</th><th>Result</th><th>Evidence from current resume</th></tr></thead><tbody>{job.requirements.map(requirement => <tr key={requirement.id}><td>{requirement.text}<small>{requirement.keywords.join(' · ')}</small></td><td><span className={`resumeStatus ${requirement.status.replaceAll(' ', '')}`}>{requirement.status}</span></td><td>{requirement.evidence.length ? requirement.evidence.map(item => <p key={item.keyword}><b>{item.keyword}:</b> {item.text}</p>) : 'No matching text found.'}</td></tr>)}</tbody></table></div></section><section className="resumeSuggestions"><header><div><span className="eyebrow">3. HUMAN REVIEW</span><h2>Choose the review notes to put in your new copy.</h2><p>These are prompts for your review, not automatic factual edits.</p></div></header><div className="suggestionList">{job.suggestions.map(suggestion => <label key={suggestion.id}><input type="checkbox" checked={selected.includes(suggestion.id)} onChange={() => toggle(suggestion.id)} disabled={!canEdit || busy}/><span><b>{suggestion.title}</b><small>{suggestion.detail}</small></span></label>)}</div><div className="resumeActions"><button className="primary" onClick={exportReview} disabled={!canEdit || busy}>{busy ? 'Generating Word copy…' : 'Generate separate Word review copy →'}</button><button onClick={() => download(`/api/resume/jobs/${job.id}/proof`, 'resume-alignment-proof.json')}>Download proof</button><button className="danger" onClick={clearJob} disabled={!canEdit}>Delete local analysis</button></div></section>{latestExport && <section className="resumeExport"><div><span className="eyebrow">4. OUTPUT</span><h2>Separate Word review copy ready.</h2><p>Created {new Date(latestExport.exportedAt).toLocaleString()} · file hash {latestExport.sha256.slice(0, 12)} · {latestExport.selectedSuggestionIds.length} selected review notes.</p></div><button className="primary" onClick={() => download(`/api/resume/jobs/${job.id}/exports/${latestExport.id}`, latestExport.filename)}>Download .docx →</button></section>}</>}</main>;
}

function formatNumber(value) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value); }

function NumbersInspector({ user }) {
  const [status, setStatus] = useState(null); const [inspection, setInspection] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const canInspect = ['admin', 'creator'].includes(user.role);
  useEffect(() => { request('/api/mac/numbers/status').then(setStatus).catch(nextError => setError(nextError.message)); }, []);
  async function inspect() {
    try { setBusy(true); setError(''); setInspection(await request('/api/mac/numbers/inspect', {})); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  }
  const table = inspection?.table; const summary = inspection?.summary;
  return <main className="numbersInspector"><div className="back">LOCAL PRODUCTIVITY / APPLE NUMBERS</div><section className="numbersHero"><div><span className="eyebrow">MAC-ONLY · EXPLICIT · READ-ONLY</span><h1>Turn the table you have<br/>into a usable summary.</h1><p>Open a Numbers spreadsheet, select the sheet containing the source table, then inspect it here. Anukriti reads the active table, calculates totals and averages transparently, and shows the proof before any future write-back is considered.</p><div className="numbersActions"><button className="primary" onClick={inspect} disabled={!canInspect || !status?.available || busy}>{busy ? 'Reading active Numbers table…' : 'Inspect active Numbers table →'}</button>{!canInspect && <small>Your {user.role} role can view this bridge but cannot inspect local spreadsheet data.</small>}</div></div><aside><span>LOCAL ADAPTER STATUS</span><b>{status === null ? 'Checking this Mac…' : status.available ? `Numbers ${status.version || 'detected'}` : 'Numbers unavailable'}</b><p>{status?.available ? 'Read-only active-table inspection is ready on this Mac.' : 'Install Apple Numbers in /Applications to use this adapter.'}</p><small>Nothing is overwritten. macOS may ask you to allow Automation access.</small></aside></section><section className="numbersSteps"><article><span>01</span><b>Open your spreadsheet</b><p>Use a normal Numbers table in the active sheet. The first table is read, up to 200 rows and 30 columns.</p></article><article><span>02</span><b>Inspect and calculate</b><p>The adapter returns display values only. It calculates numeric totals and averages in Anukriti, not by silently changing formulas.</p></article><article><span>03</span><b>Approve any future output</b><p>Native chart updates need a named, prebuilt template and a separate explicit write approval. That capability is not enabled in this release.</p></article></section>{error && <div className="error numbersError">{error}</div>}{inspection && <><section className="numbersProof"><header><div><span className="eyebrow">EXTRACTION PROOF</span><h2>{table.documentName} / {table.sheetName}</h2><p>Read {table.rowCount} rows × {table.columnCount} columns from {table.tableName} at {new Date(inspection.inspectedAt).toLocaleString()}.</p></div><span>READ ONLY</span></header><div className="dataTableWrap"><table><thead><tr>{table.rows[0]?.map((value, index) => <th key={`${value}-${index}`}>{value || `Column ${index + 1}`}</th>)}</tr></thead><tbody>{table.rows.slice(1).map((row, index) => <tr key={index}>{row.map((value, cellIndex) => <td key={`${index}-${cellIndex}`}>{value}</td>)}</tr>)}</tbody></table></div></section><section className="numbersSummary"><header><div><span className="eyebrow">CALCULATION AND VISUAL PREVIEW</span><h2>Calculated from the displayed values.</h2><p>This in-app visual is proof of the calculation. A native Numbers chart will be enabled only through a prebuilt template so its chart bindings remain explicit and repeatable.</p></div></header>{summary.numericColumns.length ? <div className="numbersMetrics">{summary.numericColumns.map(column => <article key={column.name}><span>{column.name}</span><b>{formatNumber(column.total)}</b><small>{column.values} numeric values · average {formatNumber(column.average)}</small><i><em style={{ width: `${Math.max(8, Math.min(100, (column.total / Math.max(...summary.numericColumns.map(item => Math.abs(item.total)), 1)) * 100))}%` }}/></i></article>)}</div> : <div className="adapterNote">No numeric display values were found. The table was read successfully, but it does not yet contain values that can be totaled.</div>}</section></>}</main>;
}

function NumbersResearch({ user }) {
  const [job, setJob] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [writeConfirmed, setWriteConfirmed] = useState(false);
  const canEdit = ['admin', 'creator'].includes(user.role);
  const applyJob = nextJob => {
    setJob(nextJob);
    setDrafts(Object.fromEntries((nextJob?.results || []).map(result => [result.inputId, { value: String(result.value), sourceUrl: result.sourceUrl }])));
  };
  useEffect(() => { request('/api/mac/numbers/research/jobs').then(jobs => applyJob(jobs.find(item => item.status !== 'Written') || jobs[0] || null)).catch(nextError => setError(nextError.message)); }, []);
  const capture = async () => {
    try { setBusy(true); setError(''); const result = await request('/api/mac/numbers/research/capture', {}); applyJob(result.job); setWriteConfirmed(false); setNotice(`${result.job.inputs.length} research rows captured from your active Numbers template.`); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const updateDraft = (inputId, field, value) => setDrafts(current => ({ ...current, [inputId]: { ...(current[inputId] || {}), [field]: value } }));
  const saveResult = async inputId => {
    try { setBusy(true); setError(''); const result = await request(`/api/mac/numbers/research/${job.id}/results`, { inputId, ...(drafts[inputId] || {}) }); applyJob(result.job); setNotice('Research value saved. It remains a proposal until you review and approve the Numbers update.'); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const loadDemo = async () => {
    try { setBusy(true); setError(''); const result = await request(`/api/mac/numbers/research/${job.id}/demo-results`, {}); applyJob(result.job); setNotice(result.message); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const prepare = async () => {
    try { setBusy(true); setError(''); const result = await request(`/api/mac/numbers/research/${job.id}/prepare`, {}); applyJob(result.job); setWriteConfirmed(false); setNotice('Numbers table diff is ready. Review every row before approving the write.'); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const approve = async () => {
    try { setBusy(true); setError(''); const result = await request(`/api/mac/numbers/research/${job.id}/approve`, { confirmed: writeConfirmed }); applyJob(result.job); setNotice(result.message); }
    catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const openBing = async query => {
    try {
      if (window.anukritiDesktop?.openBingResearch) await window.anukritiDesktop.openBingResearch(query);
      else window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
    } catch (nextError) { setError(nextError.message); }
  };
  const resultByInput = new Map((job?.results || []).map(result => [result.inputId, result]));
  return <main className="numbersResearch" aria-labelledby="numbers-research-title">
    <section className="numbersResearchHero"><div><span className="eyebrow">MAC DESKTOP WORKFLOW · REVIEWED WRITE-BACK</span><h1 id="numbers-research-title">Research in a browser.<br/>Return proof to Numbers.</h1><p>Use the approved two-table Numbers template. Anukriti reads only the named input table, opens your research visibly, shows the proposed output rows, then writes to the named results table only after your confirmation.</p><button className="primary" onClick={capture} disabled={!canEdit || busy}>{busy ? 'Reading Numbers template…' : 'Capture active Numbers research template →'}</button>{!canEdit && <small>Your {user.role} role can view this workflow but cannot read or write local Numbers data.</small>}</div><aside><span>TABLE CONTRACT</span><b>Anukriti Research Input</b><p>Columns: <code>Search term</code>, <code>Metric</code></p><b>Anukriti Research Results</b><p>Six fixed output columns. Keep your native chart bound to this table.</p></aside></section>
    {error && <div className="error numbersError">{error}</div>}{notice && <div className="notice">✦ {notice}</div>}
    {!job && <section className="numbersResearchEmpty"><b>Start in Numbers</b><p>Open the template, make its sheet active, then capture its named input table here. Nothing is written during capture.</p></section>}
    {job && <><section className="numbersResearchStatus"><div><span>RUN STATUS</span><b>{job.status}</b><small>{job.inputs.length} input rows · input proof {job.template.inputFingerprint}</small></div><div><span>SAFE WRITE TARGET</span><b>Anukriti Research Results</b><small>Only this named table can receive approved values.</small></div><div><span>RESULTS SAVED</span><b>{job.results.length} / {job.inputs.length}</b><small>{job.demoMode ? 'Controlled demo values — not live Bing results.' : 'Each row needs a user-verified HTTPS source.'}</small></div></section>
      {job.status !== 'Written' && <section className="researchRows"><header><div><span className="eyebrow">1. VISIBLE RESEARCH</span><h2>Open Bing, verify a value, then save its source.</h2><p>Anukriti does not scrape Bing or bypass challenges. You remain in control of the source and value.</p></div><button onClick={loadDemo} disabled={!canEdit || busy}>Load controlled demo values</button></header>{job.inputs.map(input => { const saved = resultByInput.get(input.id); const draft = drafts[input.id] || {}; const query = `${input.searchTerm} ${input.metric}`; return <article key={input.id}><div className="researchQuery"><b>{input.searchTerm}</b><small>{input.metric}</small><button onClick={() => openBing(query)}>Open Bing research ↗</button></div><label>Verified numeric value<input aria-label={`Research value for ${input.searchTerm}`} type="number" step="any" value={draft.value ?? ''} onChange={event => updateDraft(input.id, 'value', event.target.value)} disabled={!canEdit || busy}/></label><label>HTTPS source URL<input aria-label={`Source URL for ${input.searchTerm}`} type="url" placeholder="https://source.example/value" value={draft.sourceUrl ?? ''} onChange={event => updateDraft(input.id, 'sourceUrl', event.target.value)} disabled={!canEdit || busy}/></label><button className="primary" onClick={() => saveResult(input.id)} disabled={!canEdit || busy || !draft.value || !draft.sourceUrl}>{saved ? 'Update saved result' : 'Save verified result'}</button><small className={saved ? 'resultSaved' : ''}>{saved ? `✓ ${saved.value} · ${saved.status}` : 'No saved result yet.'}</small></article>; })}</section>}
      {job.status !== 'Written' && <section className="numbersProposalAction"><div><span className="eyebrow">2. REVIEW THE DIFF</span><h2>Prepare the Numbers update.</h2><p>This does not change Numbers. It freezes the rows you will review and approve.</p></div><button className="primary" onClick={prepare} disabled={!canEdit || busy || job.results.length !== job.inputs.length}>Review proposed Numbers update →</button></section>}
      {job.proposal && <section className="numbersProposal"><header><div><span className="eyebrow">3. PROPOSED WRITE</span><h2>These {job.proposal.rowCount} rows will replace the prepared output area.</h2><p>Proposal proof {job.proposal.fingerprint} · prepared {new Date(job.proposal.preparedAt).toLocaleString()}</p></div>{job.status === 'Ready to write' && <label className="confirm"><input type="checkbox" checked={writeConfirmed} onChange={event => setWriteConfirmed(event.target.checked)} disabled={!canEdit || busy}/> I reviewed the values and source URLs. Write only to the Anukriti Research Results table.</label>}</header><div className="dataTableWrap"><table><thead><tr><th>Search term</th><th>Metric</th><th>Value</th><th>Source</th><th>Checked</th><th>Status</th></tr></thead><tbody>{job.proposal.rows.map(row => <tr key={`${row.searchTerm}-${row.metric}`}><td>{row.searchTerm}</td><td>{row.metric}</td><td>{row.value}</td><td><a href={row.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a></td><td>{new Date(row.checkedAt).toLocaleString()}</td><td>{row.status}</td></tr>)}</tbody></table></div>{job.status === 'Ready to write' && <button className="primary numbersWriteButton" onClick={approve} disabled={!canEdit || busy || !writeConfirmed}>{busy ? 'Writing approved table…' : 'Approve and write to Numbers →'}</button>}</section>}
      {job.status === 'Written' && <section className="numbersWriteProof"><span>✓</span><div><b>Numbers output updated.</b><p>{job.proof.approvedRows} rows written to {job.proof.output.documentName} / {job.proof.output.sheetName} / {job.proof.output.tableName}. A chart already bound to this results table refreshes in Numbers.</p><small>Input proof {job.proof.inputFingerprint} · output proof {job.proof.proposalFingerprint} · {new Date(job.proof.completedAt).toLocaleString()}</small></div></section>}</>}
  </main>;
}

function Library({ workflows, open }) { const [search, setSearch] = useState(''); const visible = workflows.filter(job => `${job.name} ${job.status}`.toLowerCase().includes(search.toLowerCase())); return <main><div className="back">BROWSER JOB LIBRARY</div><section className="libraryTitle"><h1>Your reusable jobs.</h1><p>Each job keeps its exact browser capture and a reviewed, reusable version.</p><input className="search" placeholder="Search jobs or status" value={search} onChange={event => setSearch(event.target.value)}/></section>{visible.length ? <div className="workflowGrid">{visible.map(workflow => <button className="workflowCard" key={workflow.id} onClick={() => open(workflow)}><span className="surface">◌</span><span className="status">{workflow.status}</span><h2>{workflow.name}</h2><p>{workflow.startUrl || 'Recorder starts on a blank page'}</p><small>v{workflow.version || 1} · {workflow.recordingFile ? `${workflow.recordedSteps?.length || workflow.steps?.length || 0} captured steps` : 'Not recorded yet'} · {workflow.lastRun?.status || 'Not run yet'}</small></button>)}</div> : <div className="empty">{workflows.length ? 'No jobs match that search.' : 'No browser jobs yet. Create one, then record the task once.'}</div>}</main>; }

function App() {
  const [workflows, setWorkflows] = useState([]); const [view, setView] = useState('home'); const [active, setActive] = useState(null); const [user, setUser] = useState(null); const [workday, setWorkday] = useState(null);
  const refreshWorkday = async () => { try { const result = await request('/api/workday/today'); setWorkday(result.workday); } catch { setWorkday(null); } };
  const refresh = async () => { try { const workflowsResult = await request('/api/workflows'); setWorkflows(workflowsResult); await refreshWorkday(); } catch { setWorkflows([]); } };
  useEffect(() => { if (!authToken) return; request('/api/auth/me').then(result => { setUser(result.user); refresh(); refreshWorkday(); }).catch(() => { authToken = ''; localStorage.removeItem('anukriti_session'); }); }, []);
  const open = workflow => { setActive(workflow); setView('workflow'); };
  const addStarterJobs = async () => { try { const result = await request('/api/workflows/starter-jobs', {}); await refresh(); if (result.workflows?.length) open(result.workflows[0]); else setView('library'); } catch { setView('library'); } };
  const addControlledDemoJobs = async () => { try { const result = await request('/api/workflows/controlled-demo-jobs', {}); await refresh(); if (result.workflows?.length) open(result.workflows[0]); else setView('library'); } catch { setView('library'); } };
  const logout = async () => { try { await request('/api/auth/logout', {}); } finally { authToken = ''; localStorage.removeItem('anukriti_session'); setUser(null); setWorkflows([]); setWorkday(null); setView('home'); } };
  const activeWorkflow = workflows.find(workflow => workflow.id === active?.id) || active;
  if (!user) return <SignIn onSignedIn={nextUser => { setUser(nextUser); refresh(); refreshWorkday(); }}/>;
  return <><nav><button className="brand" onClick={() => setView('home')}>chayya<span>·</span></button><div><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>New browser job</button><button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Today{workday?.status === 'Active' ? <i>LIVE</i> : null}</button><button className={view === 'numbers' ? 'active' : ''} onClick={() => setView('numbers')}>Numbers bridge</button><button className={view === 'resume' ? 'active' : ''} onClick={() => setView('resume')}>Resume tailor</button><button className={view === 'backoffice' ? 'active' : ''} onClick={() => setView('backoffice')}>Back-office demo</button><button className={view === 'library' ? 'active' : ''} onClick={() => { refresh(); setView('library'); }}>Library <i>{workflows.length}</i></button></div><small>{user.name} · {user.role} · <button className="linkButton" onClick={logout}>Sign out</button></small></nav>{view === 'home' && <Create onCreated={workflow => { refresh(); open(workflow); }} onStarterJobs={addStarterJobs} onControlledDemoJobs={addControlledDemoJobs}/>} {view === 'day' && <WorkdayConsole request={request} initialWorkday={workday} onWorkdayChange={setWorkday}/>} {view === 'numbers' && <><NumbersInspector user={user}/><NumbersResearch user={user}/></>} {view === 'resume' && <ResumeTailor user={user}/>} {view === 'backoffice' && <BackOfficeDemo user={user}/>} {view === 'library' && <Library workflows={workflows} open={open}/>} {view === 'workflow' && activeWorkflow && <Workflow workflow={activeWorkflow} onChange={refresh}/>}<OdysseyAssistant signedIn view={view} onNavigate={setView}/></>;
}
createRoot(document.getElementById('root')).render(<App/>);
