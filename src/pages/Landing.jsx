import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HEROES, PRICING_PLANS, MODES, MIN_WORDS, MAX_WORDS, FREE_WORDS } from '../config';
import { api, track, wc } from '../lib';

const SAMPLE = 'Social media has become part of everyday life for many teenagers. It gives them a quick way to stay in touch with friends, discover news, and share their interests. At the same time, spending too much time online can affect sleep, confidence, and mental health. The impact is not the same for everyone. It often depends on how people use these platforms, what they see there, and the support they have offline. Families and schools can help by encouraging balanced habits and open conversations.';
const STEPS = [['01', 'Add your draft', 'Paste your text to get started.'], ['02', 'Choose your tone', 'Pick Natural, Academic or Simple English.'], ['03', 'Make it yours', 'Get a clearer, more natural version in seconds.']];
const FAQ = [
  ['How does Unique Write work?', 'Paste your draft, choose Natural, Academic or Simple English, then start your rewrite. The result is designed to keep your original point while improving flow.'],
  ['Can I try it for free?', 'Yes. New accounts start with 1,000 free words, and you do not need a payment card to get started.'],
  ['How much text can I rewrite at once?', `You can submit up to ${MAX_WORDS.toLocaleString()} words in one request. For a longer document, split it into smaller sections.`],
  ['Which writing styles can I choose?', 'Choose Natural for smoother phrasing, Academic for a formal tone, or Simple English for clearer wording.'],
  ['Is my text stored?', 'Your text is processed to provide the rewriting service. Results are kept for 7 days in your history, then deleted. You can delete any item sooner.'],
  ['Will it pass AI detectors?', 'We do not guarantee results with any detector. Unique Write improves readability and flow. Always follow your school’s rules on AI use.'],
  ['What counts as a word?', 'Words in the text you submit. Failed requests are never charged.'],
  ['Can I remove a result from my history?', 'Yes. You can delete an individual result from your history before it is automatically removed after 7 days.'],
  ['What if my text is longer than the limit?', 'Split it into sections of up to 2,000 words and rewrite each section separately.'],
  ['Do you change the meaning of my text?', 'The tool is designed to preserve your meaning, but always review the result to make sure it says what you intend.'],
];
const ArrowIcon = () => <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ui-icon"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SparkleIcon = () => <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ui-icon"><path d="M10 2.5 11.8 8l5.7 2-5.7 1.9-1.8 5.6-1.9-5.6-5.6-1.9 5.6-2L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m15.8 2 .5 1.6L18 4l-1.7.5-.5 1.7-.5-1.7-1.7-.5 1.7-.4.5-1.6Z" fill="currentColor" /></svg>;
const ClipboardIcon = () => <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ui-icon"><rect x="5.2" y="4.2" width="10.6" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4.2V3.5A1.5 1.5 0 0 1 9.5 2h2A1.5 1.5 0 0 1 13 3.5v.7" stroke="currentColor" strokeWidth="1.5"/></svg>;
const LockIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="feature-icon"><rect x="4.5" y="10" width="15" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const SlidersIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="feature-icon"><path d="M4 7h9m4 0h3M4 17h3m4 0h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.6"/></svg>;
const TypeIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="feature-icon"><path d="M4 6V4h16v2M12 4v16m-4 0h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export default function Landing({ user, setUser }) {
  const navigate = useNavigate();
  const [qs] = useSearchParams();
  const [text, setText] = useState('');
  const [mode, setMode] = useState('natural');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [purchaseNeeded, setPurchaseNeeded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const h1 = HEROES[qs.get('ref')?.split('_')[0]] || HEROES.default;
  useEffect(() => { track('landing_view'); }, []);
  function startPurchase(plan) { track('purchase_clicked', { plan }); navigate(`/purchase?plan=${encodeURIComponent(plan)}`); }
  const cta = <Link to={'/signup' + location.search} className="btn btn-primary px-6 py-3">Try it free <ArrowIcon /></Link>;
  const fillSample = () => setText(SAMPLE);
  const words = wc(text);
  const tooShort = words < MIN_WORDS;
  const showMinimum = text.trim().length > 0 && tooShort;

  async function humanize() {
    setSubmitted(true);
    setResult(null);
    setMessage('');
    setPurchaseNeeded(false);
    if (!text.trim()) { setMessage('Add some text to get started.'); return; }
    if (tooShort) { setMessage('Minimum 50 words required'); return; }
    if (words > MAX_WORDS) { setMessage(`Please keep your text under ${MAX_WORDS.toLocaleString()} words.`); return; }
    if (!user) { setMessage('Create a free account to humanize your text.'); return; }
    if (user.wordsRemaining != null && words > user.wordsRemaining) {
      setMessage('You’ve used your free words. Choose a plan to continue.');
      setPurchaseNeeded(true);
      track('paywall_viewed', { words, wordsRemaining: user.wordsRemaining });
      return;
    }
    setBusy(true);
    track('humanize_started', { mode, words });
    try {
      const data = await api('/humanize', { method: 'POST', body: { text, mode } });
      setResult(data);
      setReportOpen(false);
      setReportText('');
      setReportStatus('');
      setReportSent(false);
      setUser((current) => current ? { ...current, wordsRemaining: data.wordsRemaining } : current);
      track('humanize_completed', { mode, words });
    } catch (error) {
      setMessage(error.message);
      if (error.status === 402) { setPurchaseNeeded(true); track('paywall_viewed', { words }); }
    } finally {
      setBusy(false);
    }
  }

  async function pasteText() {
    try { setText(await navigator.clipboard.readText()); }
    catch { setMessage('Clipboard access is unavailable in this browser. Paste with Ctrl+V.'); }
  }

  async function copyResult() {
    try { await navigator.clipboard.writeText(result.output); setMessage('Copied to clipboard.'); }
    catch { setMessage('Could not access the clipboard.'); }
  }

  async function reportResult(event) {
    event.preventDefault();
    if (!result?.id || reportBusy) return;
    setReportBusy(true);
    setReportStatus('');
    try {
      await api(`/humanize/${result.id}/report`, { method: 'POST', body: { message: reportText.trim() } });
      setReportStatus('Thanks. Your report has been sent.');
      setReportSent(true);
      setReportOpen(false);
    } catch (error) {
      setReportStatus(error.message || 'Could not send your report. Please try again.');
    } finally {
      setReportBusy(false);
    }
  }

  function downloadResult() {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([result.output], { type: 'text/plain' }));
    link.download = 'unique-write.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="hero-copy">
          <h1>{h1}</h1>
          <p>Make every draft sound more like you. Clear, natural writing that keeps your meaning and gives your ideas room to shine.</p>
        </div>
        <div className={`workspace-card ${submitted ? 'workspace-split' : ''}`}>
          <section className="workspace-pane">
            <label className="text-label" htmlFor="landing-draft">YOUR TEXT</label>
            <textarea id="landing-draft" value={text} onChange={(e) => { setText(e.target.value); setMessage(''); }} placeholder="Paste your draft here and let’s make it flow…" />
          </section>
          {submitted && <section className="workspace-pane result-pane" aria-live="polite">
            <div className="text-label">YOUR RESULT</div>
            <div className={`result-copy ${result ? 'has-result' : ''}`}>
              {busy ? <span className="result-placeholder">Humanizing your text…</span>
                : result ? result.output
                  : !user ? <div className="result-prompt">{message}<Link to={'/signup' + location.search} className="btn btn-primary">Create a free account <ArrowIcon /></Link></div>
                    : purchaseNeeded ? <div className="result-prompt"><span>{message}</span><button type="button" onClick={() => startPurchase('student')} className="btn btn-primary">Continue with Student <ArrowIcon /></button></div>
                    : <span className="result-placeholder">{message || 'Your humanized text will appear here.'}</span>}
            </div>
            {result && <>
              <div className="result-actions"><button className="btn btn-soft" onClick={copyResult}><ClipboardIcon /> Copy</button><button className="btn btn-soft" onClick={downloadResult}>Download</button><button className="btn btn-soft" onClick={() => { setReportOpen((open) => !open); setReportStatus(''); }} disabled={reportSent}>{reportSent ? 'Reported' : 'Report issue'}</button></div>
              {reportOpen && <form className="mt-3 space-y-2" onSubmit={reportResult}>
                <label className="sr-only" htmlFor="result-report">What went wrong? (optional)</label>
                <textarea id="result-report" className="input min-h-20 w-full" maxLength={1000} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="What went wrong? (optional)" />
                <div className="flex justify-end gap-2"><button type="button" className="btn btn-soft" onClick={() => setReportOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={reportBusy}>{reportBusy ? 'Sending…' : 'Send report'}</button></div>
              </form>}
              {reportStatus && <p className="mt-2 text-right text-sm text-zinc-600" role="status">{reportStatus}</p>}
            </>}
          </section>}
          <div className="workspace-bottom">
            <div className="workspace-controls">
              <div className={`word-count ${words > MAX_WORDS || showMinimum ? 'word-count-error' : ''}`}>{words.toLocaleString()} / {MAX_WORDS.toLocaleString()} words <span>·</span> {text.length.toLocaleString()} characters{showMinimum && <> <span>·</span> Minimum 50 words required</>}</div>
              <div className="mode-select" role="group" aria-label="Writing style">{MODES.map((option) => <button type="button" key={option.id} title={option.hint} className={`mode-option ${mode === option.id ? 'active' : ''}`} onClick={() => setMode(option.id)}>{option.name}</button>)}</div>
            </div>
            <div className="workspace-actions">
              <button type="button" className="btn btn-soft" onClick={fillSample}><SparkleIcon /> Try a sample</button>
              <button type="button" className="btn btn-soft" onClick={pasteText}><ClipboardIcon /> Paste text</button>
              <button type="button" className="btn btn-primary workspace-submit" onClick={humanize} disabled={busy || tooShort || words > MAX_WORDS}>{busy ? 'Humanizing…' : 'Humanize'} <ArrowIcon /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="facts-band"><div className="facts-inner"><div className="facts-intro"><span className="facts-label">MADE TO FIT YOUR FLOW</span><strong>A little more room<br />to write naturally.</strong></div><div className="fact"><b>{FREE_WORDS.toLocaleString()}</b><span>free words to start</span></div><div className="fact"><b>{MAX_WORDS.toLocaleString()}</b><span>words per rewrite</span></div><div className="fact"><b>{MODES.length}</b><span>writing styles</span></div><div className="fact"><b>7 days</b><span>history, then auto deleted</span></div></div></section>

      <section className="steps-section"><div className="content-width"><div className="section-kicker">NO COMPLICATED WORKFLOW</div><h2>From first draft to <em>feels right.</em></h2><div className="steps-grid">{STEPS.map(([n, t, d]) => <article className="step-card" key={n}><span className="step-number">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>

      <section className="features-section"><div className="content-width"><div className="features-heading"><div><div className="section-kicker">THOUGHTFUL TOOLS, SIMPLE TO USE</div><h2>Writing help that <em>gets out of your way.</em></h2></div><p>Keep the parts that sound like you. Smooth out the parts that don’t.</p></div><div className="features-grid"><article className="feature-card feature-main"><span className="feature-icon-wrap"><SlidersIcon /></span><span className="feature-overline">YOUR STYLE, YOUR CALL</span><h3>Choose the tone<br />that fits the moment.</h3><p>Go natural, keep it academic, or make it simpler. Switch modes to match the reader and the reason you’re writing.</p><div className="mode-pills">{MODES.map((m) => <span key={m.id}>{m.name}</span>)}</div><div className="feature-art"><div className="art-line art-line-long"/><div className="art-line art-line-mid"/><div className="art-line art-line-short"/><span><SparkleIcon /></span></div></article><article className="feature-card"><span className="feature-icon-wrap"><TypeIcon /></span><span className="feature-overline">KEEP YOUR MEANING</span><h3>Your ideas stay<br />at the center.</h3><p>Get a smoother draft while keeping the point you wanted to make.</p><div className="mini-copy"><span>YOUR THOUGHT</span><i/><i/><i/></div></article><article className="feature-card"><span className="feature-icon-wrap"><LockIcon /></span><span className="feature-overline">A LITTLE MORE PEACE OF MIND</span><h3>Your writing stays<br />under your control.</h3><p>Rewrites are available in your history for 7 days, and you can delete them sooner.</p></article></div></div></section>

      <section className="audience-section"><div className="content-width audience-layout"><div className="audience-intro"><div className="section-kicker">FOR ALL THE THINGS YOU WRITE</div><h2>One draft at a time.<br /><em>More your voice.</em></h2><p className="section-lead">A little help can make a big difference, wherever your next paragraph is headed.</p><Link to={'/signup' + location.search} className="text-link">Find your flow <ArrowIcon /></Link></div><div className="audience-cards"><article><span className="audience-index">01</span><div><h3>For class</h3><p>Bring more clarity and a natural rhythm to your essays and study notes.</p></div><span className="audience-arrow"><ArrowIcon /></span></article><article><span className="audience-index">02</span><div><h3>For your work</h3><p>Polish emails, proposals, and the everyday writing that moves things forward.</p></div><span className="audience-arrow"><ArrowIcon /></span></article><article><span className="audience-index">03</span><div><h3>For your next idea</h3><p>Turn a rough first pass into something easier to read and share.</p></div><span className="audience-arrow"><ArrowIcon /></span></article></div></div></section>

      <section id="pricing" className="pricing-section content-width"><div className="section-kicker">SIMPLE, CLEAR PRICING</div><h2>Room to find <em>your words.</em></h2><p className="section-lead">Choose the plan that fits how you write.</p><div className="pricing-grid">{PRICING_PLANS.map((p, i) => <article key={p.id} className={`price-card ${i === 1 ? 'price-featured' : ''}`}>{i === 1 && <span className="popular-tag">MOST POPULAR</span>}<h3>{p.name}</h3><div className="price-amount">{p.price}<span>{p.period}</span></div><p>{p.words}</p><button type="button" onClick={() => startPurchase(p.id)} className={`btn ${i === 1 ? 'btn-primary' : 'btn-outline'} price-link`}>Continue to purchase</button></article>)}</div></section>

      <section className="faq-section"><div className="content-width faq-layout"><div><div className="section-kicker">GOOD QUESTIONS</div><h2>A few things<br />you might <em>wonder.</em></h2><p className="section-lead">Still curious? We’re happy to help.</p></div><div className="faq-list">{FAQ.map(([q, a]) => <details key={q} className="faq-item"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="closing-cta"><div className="closing-sparkle"><SparkleIcon /></div><h2>Make your next draft<br />feel like <em>you.</em></h2>{cta}<p>Free to start. Ready when you are.</p></section>
      <footer className="site-footer"><Link to="/" className="footer-brand"><img className="brand-logo" src="/logo.png" alt="" /> Unique Write</Link><span>Thoughtful words, naturally.</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/cookies">Cookies</Link><Link to="/refunds">Refunds</Link><a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a></div><small>© 2026 Unique Write</small></footer>
    </main>
  );
}
