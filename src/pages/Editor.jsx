import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, track, wc } from '../lib';
import { MODES, MAX_WORDS, PRICING_PLANS } from '../config';

function Paywall({ left, words, onClose }) {
  const navigate = useNavigate();
  const buy = (plan) => { track('purchase_clicked', { plan }); navigate(`/purchase?plan=${encodeURIComponent(plan)}`); };
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="card w-full max-w-lg bg-zinc-900">
        <h2 className="text-xl font-bold">{left === 0 ? "You've used all your free words." : `This text has ${words.toLocaleString()} words. You have ${left.toLocaleString()} left.`}</h2>
        <p className="mt-1 text-sm text-zinc-400">Continue rewriting your essays with a Student plan.</p>
        <div className="mt-4 space-y-2">
          {PRICING_PLANS.map((p) => (
            <button key={p.id} onClick={() => buy(p.id)} className="btn w-full justify-between py-3 text-left">
              <span>{p.name}<span className="block text-xs text-zinc-400">{p.words}</span></span><span>{p.price}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-sm text-zinc-500">Not now</button>
      </div>
    </div>
  );
}

export default function Editor({ user, setUser }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('natural');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [paywall, setPaywall] = useState(false);
  const words = wc(text);
  const tooLong = words > MAX_WORDS;
  const left = user?.wordsRemaining ?? Infinity;

  async function run() {
    setMsg('');
    if (words > left) { setPaywall(true); return track('paywall_viewed'); }
    setBusy(true); track('humanize_started', { mode, words });
    try {
      const d = await api('/humanize', { method: 'POST', body: { text, mode } });
      setRes(d); setUser((u) => ({ ...u, wordsRemaining: d.wordsRemaining }));
      track('humanize_completed', { mode, words });
    } catch (e) {
      if (e.status === 402) { setPaywall(true); track('paywall_viewed'); }
      else setMsg(e.message);
    } finally { setBusy(false); }
  }
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([res.output], { type: 'text/plain' })); a.download = 'humanized.txt'; a.click();
  };
  const report = () => api(`/humanize/${res.id}/report`, { method: 'POST' }).then(() => setMsg('Thanks, we got your report.')).catch((e) => setMsg(e.message));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card order-1">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{res ? 'Original' : 'Your text'}</span>
            <span className="space-x-3 text-zinc-400">
              <button onClick={async () => setText(await navigator.clipboard.readText().catch(() => ''))}>Paste</button>
              <button onClick={() => { setText(''); setRes(null); }}>Clear</button>
            </span>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your draft here…" className="input h-72 resize-y md:h-96" />
          <div className={`mt-2 text-xs ${tooLong ? 'text-red-400' : 'text-zinc-500'}`}>
            {words.toLocaleString()} / {MAX_WORDS.toLocaleString()} words · {text.length.toLocaleString()} characters
            {tooLong && ' · Your text is too long. Split it into smaller sections.'}
          </div>
        </section>

        <section className="card order-3 md:order-2">
          <div className="mb-2 text-sm font-medium">{res ? 'Humanized' : 'Result'}</div>
          <div className="input h-72 overflow-auto whitespace-pre-wrap md:h-96">{res ? res.output : <span className="text-zinc-600">Your rewritten text will appear here.</span>}</div>
          {res && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn" onClick={() => { navigator.clipboard.writeText(res.output); setMsg('Copied.'); }}>Copy</button>
              <button className="btn" onClick={run} disabled={busy}>Humanize Again</button>
              <button className="btn" onClick={download}>Download TXT</button>
              <button className="btn" onClick={report}>Report issue</button>
            </div>
          )}
        </section>

        <section className="order-2 flex flex-col items-start gap-4 md:order-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <label key={m.id} title={m.hint} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${mode === m.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700'}`}>
                <input type="radio" className="sr-only" checked={mode === m.id} onChange={() => setMode(m.id)} />{m.name}
              </label>
            ))}
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            {msg && <span className="text-sm text-zinc-400">{msg}</span>}
            <button className="btn btn-primary w-full px-8 py-3 md:w-auto" disabled={busy || !words || tooLong} onClick={run}>{busy ? 'Working…' : 'Humanize'}</button>
          </div>
        </section>
      </div>
      {paywall && <Paywall left={Number.isFinite(left) ? left : 0} words={words} onClose={() => setPaywall(false)} />}
    </main>
  );
}
