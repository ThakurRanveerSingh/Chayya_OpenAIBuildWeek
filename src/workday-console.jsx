import React, { useEffect, useState } from 'react';

const readableTime = value => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—';

export function WorkdayConsole({ request, onWorkdayChange, initialWorkday = null }) {
  const [workday, setWorkday] = useState(initialWorkday);
  const [loading, setLoading] = useState(!initialWorkday);
  const [intention, setIntention] = useState('');
  const [focus, setFocus] = useState({ title: '', minutes: '25' });
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const apply = next => { setWorkday(next); onWorkdayChange?.(next); };
  const refresh = async () => { try { const result = await request('/api/workday/today'); apply(result.workday); } catch (nextError) { setError(nextError.message); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, []);
  const start = async event => { event.preventDefault(); try { setBusy(true); setError(''); const result = await request('/api/workday/start', { intention }); apply(result.workday); } catch (nextError) { setError(nextError.message); } finally { setBusy(false); } };
  const logFocus = async event => { event.preventDefault(); try { setBusy(true); setError(''); const result = await request('/api/workday/focus', { title: focus.title, minutes: Number(focus.minutes) }); apply(result.workday); setFocus({ title: '', minutes: '25' }); } catch (nextError) { setError(nextError.message); } finally { setBusy(false); } };
  const end = async event => { event.preventDefault(); try { setBusy(true); setError(''); const result = await request('/api/workday/end', { reflection }); apply(result.workday); } catch (nextError) { setError(nextError.message); } finally { setBusy(false); } };
  const clear = async () => {
    if (!window.confirm('Clear today’s ledger? This removes today’s intention, focus blocks, and activity timeline. Your saved jobs and run history will stay intact.')) return;
    try { setBusy(true); setError(''); const result = await request('/api/workday/today', undefined, 'DELETE'); apply(result.workday); setIntention(''); setFocus({ title: '', minutes: '25' }); setReflection(''); } catch (nextError) { setError(nextError.message); } finally { setBusy(false); }
  };
  const summary = workday?.summary;
  return <main className="workdayConsole" aria-labelledby="workday-title"><section className="workdayHero"><div><span className="eyebrow">PRIVATE DAILY PRODUCTIVITY LEDGER</span><h1 id="workday-title">Make today reusable.</h1><p>Begin with an intention, log the focused effort that matters, then end the day with a clear record of work turned into reusable jobs. Nothing is tracked before you choose <b>Start today</b>.</p></div><aside><span>TODAY'S STATUS</span><b>{workday?.status || 'Not started'}</b><p>{workday?.status === 'Active' ? `Started ${readableTime(workday.startedAt)}` : workday?.status === 'Closed' ? `Closed ${readableTime(workday.endedAt)}` : 'Your activity remains private until you start.'}</p></aside></section>
    {error && <div className="error">{error}</div>}
    {loading && !workday && <section className="workdayLoading" role="status">Opening your local workday ledger…</section>}
    {!loading && !workday && <section className="workdayStart"><div><span>01</span><h2>Set a morning intention.</h2><p>One sentence is enough. It remains on this local workday only.</p></div><form onSubmit={start}><label>What would make today successful?<textarea value={intention} onChange={event => setIntention(event.target.value)} maxLength="240" placeholder="e.g. Turn my weekly report into a trusted reusable job"/></label><button className="primary" disabled={busy}>{busy ? 'Starting today…' : 'Start today →'}</button></form></section>}
    {workday && <><section className="workdayMetrics" aria-label="Today at a glance"><article><span>FOCUS TIME</span><b>{summary.focusMinutes}<small>minutes logged</small></b></article><article><span>JOBS FORGED</span><b>{summary.jobsCreated}<small>created today</small></b></article><article><span>REUSABLE ROUTES</span><b>{summary.jobsPrepared}<small>prepared safely</small></b></article><article><span>REPLAYS PROVEN</span><b>{summary.replaysPassed}<small>passed today</small></b></article></section>
      <section className="workdayLedger"><header><div><span className="eyebrow">MORNING INTENTION</span><h2>{workday.intention || 'A deliberate day, recorded safely.'}</h2><p>{workday.status === 'Active' ? 'Focus blocks and job milestones are added here as you work.' : 'This workday is closed. Its record stays available locally.'}</p></div><div className="ledgerActions"><small>{workday.date}</small><button className="danger" type="button" onClick={clear} disabled={busy}>Clear today’s ledger</button></div></header>
        {workday.status === 'Active' && <form className="focusForm" onSubmit={logFocus}><label>Focus block<input value={focus.title} onChange={event => setFocus({ ...focus, title: event.target.value })} placeholder="e.g. Review captured job steps" maxLength="120"/></label><label>Minutes<input type="number" min="5" max="480" step="5" value={focus.minutes} onChange={event => setFocus({ ...focus, minutes: event.target.value })}/></label><button className="primary" disabled={busy || !focus.title.trim()}>{busy ? 'Adding…' : 'Log focus block →'}</button></form>}
        <ol className="workdayTimeline">{workday.events.map(event => <li key={event.id}><span>{event.type === 'focus_logged' ? '◒' : event.type.includes('run') ? '↻' : event.type.includes('job') ? '✦' : '•'}</span><div><b>{event.label}</b><small>{readableTime(event.at)}</small></div></li>)}</ol>
      </section>
      {workday.status === 'Active' && <section className="workdayEnd"><div><span className="eyebrow">END OF DAY</span><h2>Close with a useful note.</h2><p>Capture what worked, what needs correction, or the next reusable route to build tomorrow.</p></div><form onSubmit={end}><label>End-of-day note <small>Optional</small><textarea value={reflection} onChange={event => setReflection(event.target.value)} maxLength="360" placeholder="e.g. Visible rehearsal passed; background replay is ready tomorrow."/></label><button disabled={busy}>{busy ? 'Closing day…' : 'Close today →'}</button></form></section>}
      {workday.status === 'Closed' && <section className="workdayClosed"><span>✓</span><div><b>Today’s work is safely logged.</b><p>{workday.reflection || 'No end-of-day note was added.'}</p><small>{summary.focusMinutes} focus minutes · {summary.jobsCreated} jobs created · {summary.replaysPassed} verified replays</small></div></section>}
    </>}
  </main>;
}
