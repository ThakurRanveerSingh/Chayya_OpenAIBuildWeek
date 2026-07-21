import React, { useMemo, useState } from 'react';

const welcome = signedIn => signedIn
  ? { author: 'guide', text: 'I am your local Odyssey Assistant. I can guide recording, live pauses, daily focus, and safe replays. I do not send your chat anywhere.' }
  : { author: 'guide', text: 'Welcome to Chayya. I can explain how to turn one carefully completed task into a reusable job. Sign in when you are ready to begin.' };

function replyFor(text, signedIn) {
  const normalized = text.toLowerCase().trim();
  if (/wait|pause|slow|load/.test(normalized)) return { text: 'Live waits are added while the recorder is open. As soon as a click, keyboard entry, choice, or navigation appears in the live action rail, choose that action and add a pause before your next browser action.' };
  if (/today|day|morning|eod|focus|track/.test(normalized)) return signedIn ? { text: 'Open Today to start your private workday, log focus blocks, and see the jobs you created, prepared, or replayed after you started it.', action: { label: 'Open Today', view: 'day' } } : { text: 'After sign-in, Today lets you record a morning intention, focus blocks, and an end-of-day note. It tracks only items you add and job actions performed after you start the day.' };
  if (/record|job|replay|reuse/.test(normalized)) return signedIn ? { text: 'Start with New browser job. Record the task in the visible browser, review every captured action, prepare the reusable code, and rehearse it visibly before a background run.', action: { label: 'Open browser jobs', view: 'home' } } : { text: 'Chayya records browser work only after you deliberately start the recorder. It preserves the raw capture, checks known fragile patterns, and asks for confirmation before a run.' };
  if (/private|safe|security|data/.test(normalized)) return { text: 'This local build keeps workday data and jobs in its local store. The assistant uses deterministic on-device replies and does not make a model or web call with your message.' };
  return { text: signedIn ? 'Try asking about live waits, your workday, reusable jobs, or privacy. I will point you to the next safe step.' : 'Try asking how jobs work, how live waits work, or whether your local data is private.' };
}

export function OdysseyAssistant({ signedIn, view, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(() => [welcome(signedIn)]);
  const suggestions = useMemo(() => signedIn
    ? (view === 'workflow' ? ['How do live waits work?', 'How do I make this job reusable?', 'How is this safe?'] : ['Help me plan today', 'How do live waits work?', 'How do I create a reusable job?'])
    : ['What does Chayya do?', 'How do live waits work?', 'Is my data private?'], [signedIn, view]);
  const send = text => {
    const question = text.trim();
    if (!question) return;
    setMessages(current => [...current, { author: 'user', text: question }, { author: 'guide', ...replyFor(question, signedIn) }]);
    setDraft('');
  };
  return <aside className={`odysseyAssistant ${open ? 'open' : ''}`} aria-label="Chayya Assistant">
    {open && <section className="assistantPanel" aria-label="Personal productivity assistant">
      <header><div><span className="assistantSeal" aria-hidden="true">✦</span><div><b>Chayya Guide</b><small>Local, guidance-only</small></div></div><button className="assistantClose" aria-label="Close personal assistant" onClick={() => setOpen(false)}>×</button></header>
      <div className="assistantMessages" aria-live="polite">{messages.map((message, index) => <div className={`assistantMessage ${message.author}`} key={`${message.author}-${index}`}><span>{message.author === 'guide' ? 'A' : 'You'}</span><div><p>{message.text}</p>{message.action && <button onClick={() => { onNavigate?.(message.action.view); setOpen(false); }}>{message.action.label} →</button>}</div></div>)}</div>
      <div className="assistantSuggestions">{suggestions.map(suggestion => <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}</div>
      <form onSubmit={event => { event.preventDefault(); send(draft); }}><label className="srOnly" htmlFor={`assistant-message-${signedIn ? 'app' : 'signin'}`}>Ask the Chayya Guide</label><input id={`assistant-message-${signedIn ? 'app' : 'signin'}`} value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask for the next step" maxLength="240"/><button disabled={!draft.trim()}>Send</button></form>
      <p className="assistantPrivacy">No model call, browser action, or data sharing happens from this chat.</p>
    </section>}
    <button className="assistantLauncher" aria-expanded={open} aria-controls="odyssey-assistant-panel" onClick={() => setOpen(current => !current)}>{open ? 'Close guide' : 'Ask your guide'} <span aria-hidden="true">✦</span></button>
  </aside>;
}
