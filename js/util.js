// Small helpers: building elements, dates as 'YYYY-MM-DD' strings, times as minutes after the
// day's local midnight (past 1440 until the next sunrise), and settings kept in localStorage.

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  const add = (c) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  };
  children.forEach(add);
  return el;
}

export function svg(markup, cls = 'ico') {
  const span = document.createElement('span');
  span.className = cls;
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = markup;
  return span;
}

export const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WD3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December'];

export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const fmtDate = (dt) => dt.toISOString().slice(0, 10);
export const addDays = (s, n) => { const d = parseDate(s); d.setUTCDate(d.getUTCDate() + n); return fmtDate(d); };
export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(parseDate(s).getTime());

export function longDate(s) {
  const d = parseDate(s);
  return `${WD3[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
}
export function shortDate(s) {
  const d = parseDate(s);
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()].slice(0, 3)}`;
}

// The date and minutes after midnight, now, in a time zone.
export function nowIn(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

const pad = (n) => String(n).padStart(2, '0');
// Minutes after the day's midnight → 'hh:mm', past midnight as the PDFs print it: 00:12*.
// With twelve = true, 12-hour times (and the * kept for the next day).
export function fmtTime(m, twelve = false) {
  if (m == null) return '—';
  m = Math.round(m);
  const next = m >= 1440;
  const prev = m < 0;
  m = ((m % 1440) + 1440) % 1440;
  let hh = Math.floor(m / 60);
  const mm = m % 60;
  let suffix = '';
  if (twelve) {
    suffix = hh < 12 ? ' am' : ' pm';
    hh = hh % 12 || 12;
  }
  return `${twelve ? hh : pad(hh)}:${pad(mm)}${suffix}${next ? '*' : prev ? '⁻' : ''}`;
}
export const span = (a, b, twelve) => `${fmtTime(a, twelve)} – ${fmtTime(b, twelve)}`;

// Settings: one JSON object in localStorage, which may be unavailable (private windows).
const KEY = 'ashtanga.settings';
export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* not kept */ }
}

// A phrase with *bold* marks, and TeX's \- as a soft hyphen.
export function rich(text) {
  const out = [];
  for (const piece of String(text).replace(/\\-/g, '­').split(/(\*[^*]+\*)/)) {
    if (piece) out.push(/^\*.*\*$/.test(piece) ? h('strong', null, piece.slice(1, -1)) : piece);
  }
  return out;
}
export const plain = (text) => String(text).replace(/\\-/g, '').replace(/\*/g, '');

// The moon on a tithi (1…30): lit fraction from the phase, waxing lit on the right.
export function moonIcon(tithi, size = 28) {
  const phase = ((tithi - 0.5) / 30) * 2 * Math.PI;
  const k = Math.cos(phase); // 1 new, -1 full
  const r = 10;
  const waxing = tithi <= 15;
  const rx = Math.abs(k) * r;
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = (k > 0) === waxing ? 0 : 1;
  const d = `M12 2 A${r} ${r} 0 0 ${sweepOuter} 12 22 A${rx} ${r} 0 0 ${sweepInner} 12 2Z`;
  return svg(`<svg viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" class="moon-dark"/><path d="${d}" class="moon-lit"/><circle cx="12" cy="12" r="10" class="moon-ring"/></svg>`, 'moon');
}
