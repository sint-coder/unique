import { useEffect, useState } from 'react';
import { api, track } from '../lib';

const Row = ({ k, v }) => <div className="flex justify-between border-b border-zinc-800 py-2 text-sm"><span className="text-zinc-400">{k}</span><span>{v ?? '-'}</span></div>;
const date = (d) => (d ? new Date(d).toLocaleDateString() : null);

export function Settings({ user, setUser }) {
  const [sub, setSub] = useState(null);
  const [use, setUse] = useState(null);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const load = () => api('/billing/subscription').then(setSub).catch(() => setSub({}));
  useEffect(() => { load(); api('/usage').then(setUse).catch(() => {}); }, []);
  const cancel = async () => {
    if (!confirm('Cancel at the end of the current billing period?')) return;
    await api('/billing/cancel', { method: 'POST' }); track('subscription_cancelled'); load();
  };
  const logout = async () => {
    setMessage('');
    try { await api('/auth/logout', { method: 'POST' }); setUser(null); location.assign('/'); }
    catch (error) { setMessage(error.message); }
  };
  const deleteAccount = async () => {
    setMessage('');
    setDeleteBusy(true);
    try {
      await api('/account', { method: 'DELETE' });
      setUser(null);
      location.assign('/');
    } catch (error) {
      setMessage(error.message || 'Could not delete your account. Please try again.');
      setDeleteBusy(false);
    }
  };
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">Account</h1>
      <div className="card">
        <Row k="Email" v={user.email} />
        <Row k="Plan" v={sub?.plan || 'Free'} />
        <Row k="Words used" v={use?.wordsUsed?.toLocaleString()} />
        <Row k="Words remaining" v={user.wordsRemaining?.toLocaleString()} />
        <Row k="Billing status" v={sub?.status} />
        <Row k={sub?.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'} v={date(sub?.currentPeriodEnd)} />
      </div>
      <div className="mt-4 flex gap-2">
        {sub?.status === 'active' && !sub.cancelAtPeriodEnd && <button className="btn" onClick={cancel}>Cancel subscription</button>}
        <button className="btn" onClick={logout}>Log out</button>
      </div>
      {message && <p className="mt-3 text-sm text-red-500" role="alert">{message}</p>}
      <section className="card mt-8 border border-red-200" aria-labelledby="delete-account-heading">
        <h2 id="delete-account-heading" className="text-lg font-semibold text-red-700">Delete account</h2>
        <p className="mt-2 text-sm text-zinc-600">This signs you out, removes your saved writing, and disables this account. Any active subscription will be cancelled.</p>
        {!confirmDelete
          ? <button type="button" className="btn mt-4 border border-red-300 text-red-700" onClick={() => setConfirmDelete(true)}>Delete my account</button>
          : <div className="mt-4 rounded-xl bg-red-50 p-4" role="group" aria-label="Confirm account deletion">
            <p className="text-sm font-medium text-red-800">Are you sure? This action cannot be undone.</p>
            <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="btn border border-red-300 bg-red-600 text-white" onClick={deleteAccount} disabled={deleteBusy}>{deleteBusy ? 'Deleting…' : 'Confirm deletion'}</button><button type="button" className="btn" onClick={() => setConfirmDelete(false)} disabled={deleteBusy}>Keep my account</button></div>
          </div>}
      </section>
    </main>
  );
}

export function History() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => { api('/humanize/history').then((d) => setItems(d.items)).catch(() => setItems([])); }, []);
  const view = async (id) => setOpen(await api('/humanize/' + id));
  const del = async (id) => {
    await api('/humanize/' + id, { method: 'DELETE' });
    setItems((l) => l.filter((i) => i.id !== id)); setOpen(null);
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">History</h1>
      <p className="mb-4 text-sm text-zinc-500">Texts are deleted automatically after 7 days.</p>
      {items?.length === 0 && <p className="text-zinc-400">Nothing here yet.</p>}
      <div className="space-y-2">
        {items?.map((i) => (
          <div key={i.id} className="card flex items-center justify-between text-sm">
            <span>{date(i.createdAt)} · {i.mode} · {i.inputWordCount} words</span>
            <span className="space-x-2">
              <button className="btn" onClick={() => view(i.id)}>Open</button>
              <button className="btn" onClick={() => del(i.id)}>Delete</button>
            </span>
          </div>
        ))}
      </div>
      {open && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="card"><div className="mb-1 text-xs text-zinc-500">Original</div><p className="whitespace-pre-wrap text-sm">{open.input}</p></div>
          <div className="card"><div className="mb-1 text-xs text-zinc-500">Humanized</div><p className="whitespace-pre-wrap text-sm">{open.output}</p></div>
        </div>
      )}
    </main>
  );
}
