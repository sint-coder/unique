import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, attribution, track } from '../lib';

const TEXT = {
  login: ['Log in', '/auth/login'], signup: ['Create your account', '/auth/register'],
  forgot: ['Reset your password', '/auth/forgot-password'], reset: ['Choose a new password', '/auth/reset-password'],
};

export default function Auth({ kind, setUser }) {
  const nav = useNavigate();
  const [qs] = useSearchParams();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const captchaBox = useRef(null);
  const captchaWidget = useRef(null);
  const googleHref = '/api/auth/google?' + new URLSearchParams(attribution()).toString();
  const [title, url] = TEXT[kind];
  useEffect(() => { if (kind === 'signup') track('signup_started'); }, [kind]);
  useEffect(() => {
    if (!captchaRequired) return;
    api('/config').then((config) => setCaptchaSiteKey(config.turnstileSiteKey || '')).catch(() => {});
  }, [captchaRequired]);
  useEffect(() => {
    if (!captchaRequired || !captchaSiteKey || !captchaBox.current) return;
    const render = () => {
      if (!window.turnstile || !captchaBox.current || captchaWidget.current !== null) return;
      captchaWidget.current = window.turnstile.render(captchaBox.current, {
        sitekey: captchaSiteKey,
        callback: setCaptchaToken,
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      });
    };
    let script = document.querySelector('script[data-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    render();
    return () => script.removeEventListener('load', render);
  }, [captchaRequired, captchaSiteKey]);

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const body = kind === 'reset' ? { token: qs.get('token'), password: f.password } : { ...f, ...(kind === 'signup' ? { attribution: attribution() } : {}), ...(captchaToken ? { turnstileToken: captchaToken } : {}) };
      await api(url, { method: 'POST', body });
      if (kind === 'forgot') return setOk('If that email exists, a reset link is on its way.');
      if (kind === 'reset') return nav('/login');
      if (kind === 'signup') { setUser(await api('/auth/me')); return nav('/verify-email?sent=1'); }
      setUser(await api('/auth/me'));
      nav('/');
    } catch (e2) {
      setErr(e2.message);
      if (e2.status === 428) setCaptchaRequired(true);
      if (captchaRequired && e2.status !== 428) { setCaptchaToken(''); if (window.turnstile && captchaWidget.current !== null) window.turnstile.reset(captchaWidget.current); }
    } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      {(kind === 'login' || kind === 'signup') && <>
        <a href={googleHref} className="btn w-full">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A10.99 10.99 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.06H2.15A11 11 0 0 0 1 12c0 1.78.43 3.46 1.15 4.94l3.69-2.84Z" />
            <path fill="#EA4335" d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.15 7.06l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
          </svg>
          <span>Continue with Google</span>
        </a>
        <div className="my-4 text-center text-xs text-zinc-500">or</div>
      </>}
      <form onSubmit={submit} className="space-y-3">
        {kind !== 'reset' && <input className="input" type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
        {kind !== 'forgot' && <input className="input" type="password" required minLength={8} placeholder="Password (8+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />}
        {captchaRequired && <div><div ref={captchaBox} />{!captchaSiteKey && <p className="mt-2 text-xs text-zinc-500">Security check is required. Configure the Turnstile site key to continue.</p>}</div>}
        {err && <p className="text-sm text-red-400">{err}</p>}
        {ok && <p className="text-sm text-emerald-400">{ok}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : title}</button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-400">
        {kind === 'login' && <><Link to="/forgot">Forgot password?</Link> · <Link to="/signup">Sign up</Link></>}
        {kind === 'signup' && <>Have an account? <Link to="/login" className="text-indigo-400">Log in</Link></>}
      </p>
    </main>
  );
}
