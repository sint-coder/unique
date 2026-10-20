export const wc = (t) => (t.trim().match(/\S+/g) || []).length;

const KEYS = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const DAY = 864e5;

// First-touch attribution kept 30 days; sent with events and registration.
export function initAttribution() {
  try {
    if (!localStorage.getItem('vid')) localStorage.setItem('vid', crypto.randomUUID());
    const qs = new URLSearchParams(location.search);
    const found = {};
    KEYS.forEach((k) => qs.get(k) && (found[k] = qs.get(k)));
    const cur = JSON.parse(localStorage.getItem('attr') || 'null');
    if (Object.keys(found).length && (!cur || Date.now() - cur.t > 30 * DAY))
      localStorage.setItem('attr', JSON.stringify({ ...found, t: Date.now() }));
  } catch {}
}
export const attribution = () => {
  try { return { vid: localStorage.getItem('vid'), ...JSON.parse(localStorage.getItem('attr') || '{}') }; }
  catch { return {}; }
};

export async function api(path, { body, ...opts } = {}) {
  const headers = new Headers(opts.headers || {});
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const r = await fetch('/api' + path, {
    credentials: 'include',
    ...opts,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { status: r.status, data });
  return data;
}

// Events: landing_view, signup_started, signup_completed, humanize_started, humanize_completed,
// paywall_viewed, purchase_clicked, checkout_started, payment_success, payment_failed, subscription_cancelled
export const track = (event, props = {}) =>
  api('/analytics', { method: 'POST', body: { event, props, ...attribution() }, keepalive: true }).catch(() => {});
