import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib';

export default function VerifyEmail() {
  const [query] = useSearchParams();
  const token = query.get('token');
  const [state, setState] = useState(token ? 'checking' : 'sent');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!token) return;
    let alive = true;
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => alive && setState('verified'))
      .catch((error) => { if (alive) { setState('error'); setMessage(error.message); } });
    return () => { alive = false; };
  }, [token]);

  return <main className="mx-auto max-w-md px-4 py-20 text-center">
    <div className="card">
      <h1 className="mb-3 text-2xl font-bold">{state === 'verified' ? 'Email verified' : state === 'error' ? 'Could not verify email' : state === 'sent' ? 'Check your inbox' : 'Verifying your email…'}</h1>
      <p className="text-sm text-zinc-400">{state === 'verified' ? 'Your account is ready. You can now start rewriting.' : state === 'error' ? (message || 'This link may have expired or already been used.') : state === 'sent' ? 'We sent you a verification link. Open it to activate humanizing for your account.' : 'This should only take a moment.'}</p>
      {(state === 'verified' || state === 'sent') && <Link to="/" className="btn btn-primary mt-6">Continue to Unique Write</Link>}
      {state === 'error' && <Link to="/login" className="btn mt-6">Back to log in</Link>}
    </div>
  </main>;
}
