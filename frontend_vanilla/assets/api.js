/* Adi-Sanlo — API client wrapper */
const API_BASE = 'https://adi-sanlo-production.up.railway.app';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

const fmt = {
  naira: (n) => '₦' + Number(n || 0).toLocaleString('en-NG'),
  date:  (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—',
  time:  (d) => d ? new Date(d).toLocaleString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—',
};

function badge(status) {
  const map = {
    active:     'badge-active',
    past_due:   'badge-past-due',
    dunning:    'badge-dunning',
    paused:     'badge-paused',
    cancelled:  'badge-cancelled',
    paid:       'badge-paid',
    failed:     'badge-failed',
    open:       'badge-open',
    incomplete: 'badge-incomplete',
  };
  const cls = map[status] || 'badge-paused';
  return `<span class="badge ${cls}">${status.replace('_', ' ')}</span>`;
}

function showError(containerId, message) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state"><h3>Could not load data</h3><p>${message}</p></div>`;
}
