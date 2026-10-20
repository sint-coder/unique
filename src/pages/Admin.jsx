import { useEffect, useState } from 'react';
import { api } from '../lib';

const emptyForm = {
  creators: { name: '', handle: '', notes: '' },
  hooks: { title: '', body: '' },
  'campaign-links': { ref_code: '', campaign: '', creator_id: '', hook_id: '', views: '0', active: '1' },
};
const labels = { creators: 'Creators', hooks: 'Hooks', 'campaign-links': 'Campaign links' };
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days) => { const date = new Date(); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10); };

export default function Admin({ user }) {
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [records, setRecords] = useState({ creators: [], hooks: [], 'campaign-links': [] });
  const [kind, setKind] = useState('creators');
  const [form, setForm] = useState({ ...emptyForm.creators });
  const [editingId, setEditingId] = useState(null);
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [ref, setRef] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const range = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const funnelRange = range + (ref.trim() ? `&ref=${encodeURIComponent(ref.trim())}` : '');
    const [s, f, c, creators, hooks, links] = await Promise.all([
      api('/admin/stats' + range), api('/admin/funnel' + funnelRange), api('/admin/campaigns'),
      api('/admin/creators'), api('/admin/hooks'), api('/admin/campaign-links'),
    ]);
    setStats(s); setFunnel(f); setCampaigns(c.items || []);
    setRecords({ creators: creators.items || [], hooks: hooks.items || [], 'campaign-links': links.items || [] });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => load().catch((error) => setMessage(error.message)), 250);
    return () => window.clearTimeout(timer);
  }, [from, to, ref]);
  const selectKind = (value) => { setKind(value); setForm({ ...emptyForm[value] }); setEditingId(null); };

  async function save(e) {
    e.preventDefault(); setMessage(''); setBusy(true);
    try {
      const payload = { ...form };
      for (const key of ['creator_id', 'hook_id']) if (key in payload && payload[key] === '') payload[key] = null;
      const path = '/admin/' + kind + (editingId ? '/' + editingId : '');
      await api(path, { method: editingId ? 'PATCH' : 'POST', body: payload });
      setForm({ ...emptyForm[kind] }); setEditingId(null); setMessage(editingId ? 'Changes saved.' : 'Record created.');
      await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }

  function edit(item) {
    setForm(Object.fromEntries(Object.keys(emptyForm[kind]).map((key) => [key, item[key] == null ? '' : String(item[key])])));
    setEditingId(item.id);
    setMessage('Editing record #' + item.id);
    document.getElementById('admin-record-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
  const conversion = (value, total) => total ? `${(Number(value || 0) / Number(total) * 100).toFixed(1)}% conversion` : '—';
  if (user?.role !== 'admin') return <main className="mx-auto max-w-lg px-4 py-16"><div className="card"><h1 className="text-xl font-bold">Page not found</h1></div></main>;

  const fields = Object.keys(form);
  const recordsForKind = records[kind] || [];
  const recordName = (item) => kind === 'creators' ? item.name : kind === 'hooks' ? item.title : item.ref_code;
  const recordDetail = (item) => kind === 'creators'
    ? [item.handle && `@${item.handle}`, item.notes].filter(Boolean).join(' · ')
    : kind === 'hooks'
      ? item.body
      : [item.campaign, `Views: ${Number(item.views || 0).toLocaleString()}`, Number(item.active) ? 'Active' : 'Inactive'].filter(Boolean).join(' · ');

  return <main className="admin-page mx-auto max-w-6xl px-4 py-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="section-kicker justify-start">UNIQUE WRITE</p><h1 className="mt-2 text-3xl font-bold">Admin dashboard</h1><p className="mt-1 text-sm text-zinc-500">Signed in as {user.email}</p></div>
      <button className="btn" onClick={() => load().catch((error) => setMessage(error.message))}>Refresh data</button>
    </div>

    {message && <p className="mb-4 text-sm text-zinc-600" role="status">{message}</p>}
    <section className="card mb-4 flex flex-wrap items-end gap-3">
      <label className="text-sm">From<input className="input mt-1 block" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label>
      <label className="text-sm">To<input className="input mt-1 block" type="date" value={to} min={from} max={today()} onChange={(event) => setTo(event.target.value)} /></label>
      <label className="text-sm">Referral code<input className="input mt-1 block" type="search" value={ref} placeholder="All sources" onChange={(event) => setRef(event.target.value)} /></label>
      <span className="pb-2 text-sm text-zinc-500">Date range applies to dashboard and funnel. Referral code filters the funnel. Campaign totals are all-time.</span>
    </section>

    <section className="admin-metrics">
      {[
        ['Signups', stats?.signups], ['Paying users', stats?.paidUsers],
        ['Signup conversion', `${((stats?.conversionRate || 0) * 100).toFixed(1)}%`],
        ['Revenue', money(stats?.revenue)], ['MRR', money(stats?.mrr)],
        ['Active users · 7d', stats?.activeUsers], ['AI cost', money(stats?.aiCostEstimate)],
      ].map(([label, value]) => <article className="card" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></article>)}
    </section>

    <section className="card mt-6">
      <h2 className="mb-1 text-lg font-semibold">Conversion funnel</h2>
      <p className="mb-4 text-sm text-zinc-500">Unique browsers, registrations, humanizer usage, and purchase clicks for the selected period. Clicks from signed-in accounts are counted separately.</p>
      <div className="admin-funnel">{[
        ['Unique visitors', funnel?.visitors, ''],
        ['Registrations', funnel?.signups, conversion(funnel?.signups, funnel?.visitors)],
        ['Used humanizer', funnel?.firstHumanize, conversion(funnel?.firstHumanize, funnel?.signups)],
        ['Purchase clicks', funnel?.purchaseClicks, conversion(funnel?.purchaseClicks, funnel?.visitors)],
        ['Registered clickers', funnel?.registeredPurchaseClickers, conversion(funnel?.registeredPurchaseClickers, funnel?.signups)],
        ['Paid users', funnel?.paid, conversion(funnel?.paid, funnel?.signups)],
      ].map(([label, value, detail]) => <div key={label}><span>{label}</span><strong>{value ?? '—'}</strong><small>{detail || 'unique count'}</small></div>)}</div>
    </section>

    <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
      <div className="card overflow-x-auto">
        <h2 className="mb-1 text-lg font-semibold">Campaign performance · all-time</h2>
        <p className="mb-4 text-sm text-zinc-500">Campaign revenue is summed once per successful payment.</p>
        <table className="admin-table"><thead><tr><th>Ref code</th><th>Visitors</th><th>Signups</th><th>Paid users</th><th>Revenue</th><th>Paid / 1k</th><th>Revenue / 100k views</th></tr></thead><tbody>
          {campaigns.map((item) => <tr key={item.ref_code}><td>{item.ref_code}</td><td>{item.visitors}</td><td>{item.signups}</td><td>{item.paid_users}</td><td>{money(Number(item.revenue_cents) / 100)}</td><td>{Number(item.paid_users_per_1000_visitors || 0).toFixed(1)}</td><td>{money(item.revenue_per_100k_views)}</td></tr>)}
          {campaigns.length === 0 && <tr><td colSpan="7">No campaign data yet.</td></tr>}
        </tbody></table>
      </div>

      <div id="admin-record-form" className="card">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit record' : 'Add a record'}</h2>
        <form onSubmit={save} className="space-y-3">
          <label className="block"><span className="mb-1 block text-sm text-zinc-600">Record type</span><select className="input" value={kind} onChange={(event) => selectKind(event.target.value)}><option value="creators">Creator</option><option value="hooks">Hook</option><option value="campaign-links">Campaign link</option></select></label>
          {fields.map((key) => <label key={key} className="block"><span className="mb-1 block text-sm capitalize text-zinc-600">{key.replaceAll('_', ' ')}</span>
            {key === 'creator_id' || key === 'hook_id' ? <select className="input" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })}><option value="">None</option>{records[key === 'creator_id' ? 'creators' : 'hooks'].map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}</select>
              : key === 'active' ? <select className="input" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })}><option value="1">Active</option><option value="0">Inactive</option></select>
                : key === 'notes' || key === 'body' ? <textarea className="input min-h-24" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
                  : <input className="input" required={['name', 'title', 'ref_code'].includes(key)} min={key === 'views' ? 0 : undefined} type={key === 'views' ? 'number' : 'text'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />}
          </label>)}
          <div className="flex gap-2"><button className="btn btn-primary flex-1" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create'}</button>{editingId && <button type="button" className="btn" onClick={() => { setForm({ ...emptyForm[kind] }); setEditingId(null); setMessage('Edit cancelled.'); }}>Cancel</button>}</div>
        </form>
      </div>
    </section>

    <section className="card mt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Manage records</h2><p className="text-sm text-zinc-500">Edit creators, hooks, and campaign links.</p></div><select className="input max-w-xs" value={kind} onChange={(event) => selectKind(event.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="space-y-2">{recordsForKind.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3"><div className="min-w-0"><strong className="block truncate text-sm">{recordName(item)}</strong><span className="block truncate text-xs text-zinc-500">{recordDetail(item) || '—'}</span></div><button className="btn" onClick={() => edit(item)}>Edit</button></div>)}{recordsForKind.length === 0 && <p className="text-sm text-zinc-500">No {labels[kind].toLowerCase()} yet.</p>}</div>
    </section>
  </main>;
}
