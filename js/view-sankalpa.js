// Sankalpa: the Shakta Ashtanga sankalpa (as the Telegram bot and the Ashtangam print it), the
// panchanga sankalpa (the panchaanga's, js/sankalpa.js), or both together, the panchanga one first
// and the dinanityAvidyA last, as the daily ICS has them. Each is as printed: from sunrise, with each
// change of anga and its time in brackets. Large type that can be made larger, to copy or share.
// In Devanagari the times are in Devanagari digits, as the ICS prints them.
import { h, svg, rich, saveSettings } from './util.js';
import { ICONS } from './icons.js';
import { ashtanga, ashtangaSankalpa, vidya } from './ashtanga.js';
import { sankalpaText } from './sankalpa.js';

// The text to copy or share, formatted for WhatsApp: *bold* kept (bold runs joined by a hyphen or
// a space are merged, as WhatsApp will not bold *a*-*b*; a bold running into a word is carried to
// its end), TeX's soft hyphens dropped, one phrase to a line, and a blank line before each part.
function whatsapp(lines, titles) {
  return lines.map((l, i) => (i && titles.has(l) ? '\n' : '') + waLine(l)).join('\n');
}
function waLine(line) {
  const segs = [];
  for (const piece of line.replace(/\\-/g, '').split(/(\*[^*]+\*)/)) {
    if (!piece) continue;
    const bold = /^\*[^*]+\*$/.test(piece);
    const t = bold ? piece.slice(1, -1) : piece;
    const prev = segs.at(-1);
    const prev2 = segs.at(-2);
    if (bold && prev && !prev.bold && /^[\s-]*$/.test(prev.t) && prev2?.bold) { prev2.t += prev.t + t; segs.pop(); continue; }
    segs.push({ bold, t });
  }
  // WhatsApp bolds only up to a word's end: *भृगु*वासर… → *भृगुवासर…*
  segs.forEach((s, k) => {
    const next = segs[k + 1];
    const m = s.bold && next && !next.bold && next.t.match(/^[\p{L}\p{M}]+/u);
    if (m) { s.t += m[0]; next.t = next.t.slice(m[0].length); }
  });
  return segs.map((s) => (s.bold ? `*${s.t}*` : s.t)).join('');
}

const KINDS = [['ashtanga', 'Aṣṭāṅga'], ['panchanga', 'Pañcāṅga'], ['combined', 'Combined']];

export async function renderSankalpa(ctx, root) {
  const got = await ctx.loadDay(ctx.date);
  if (!got) return root.append(h('p', { class: 'empty' }, 'No data for this day.'));
  const { day, year } = got;
  const { A, S, settings } = ctx;
  const P = A.phrases;
  const a = ashtanga(day);
  const digits = ctx.script === 'devanagari' && S.digits ? S.digits : null;
  // A time after midnight is marked with ∗, not *, which is the bold mark here and in WhatsApp.
  const T = (m) => {
    const t = ctx.T(m).replace('*', '∗');
    return digits ? t.replace(/\d/g, (d) => digits[d]) : t;
  };

  const ashtangaLines = () => [`*${P.title}*`, ...ashtangaSankalpa(A, a, T)];
  const vidyaLine = () => `*${P.vidyA}* – ${vidya(A, a)}`;
  const panchangaLines = () => [`*${P.panca_title}*`, P.panca_head,
    ...sankalpaText(day, year.samvatsara, S.sankalpa, T).split('\t').map((p) => p.trim()).filter(Boolean)];
  const LINES = {
    ashtanga: () => [...ashtangaLines(), vidyaLine()],
    panchanga: panchangaLines,
    combined: () => [...panchangaLines(), ...ashtangaLines(), vidyaLine()],
  };

  // A title starts a new part, with space before it.
  const titles = new Set([`*${P.title}*`, `*${P.panca_title}*`]);
  let which = LINES[settings.sankalpaWhich] ? settings.sankalpaWhich : 'ashtanga';
  let size = Number(settings.sankalpaSize) || 1.2;
  let text = '';
  const quiet = (patch) => { Object.assign(settings, patch); saveSettings(settings); };

  const body = h('article', { class: 'sankalpa', lang: 'sa', style: `font-size:${size}rem` });
  const segs = h('div', { class: 'segs no-swipe', role: 'group', 'aria-label': 'Which sankalpa' },
    KINDS.map(([id, label]) => h('button', { class: 'seg', 'data-id': id, onclick: () => { which = id; quiet({ sankalpaWhich: id }); draw(); } }, label)));

  function draw() {
    for (const b of segs.children) { const on = b.dataset.id === which; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
    const lines = LINES[which]();
    text = whatsapp(lines, titles);
    body.replaceChildren(...lines.map((l) => h('p', { class: titles.has(l) ? 'title' : '' }, rich(l))));
  }

  const resize = (by) => {
    size = Math.min(2.6, Math.max(0.9, Math.round((size + by) * 100) / 100));
    body.style.fontSize = `${size}rem`;
    quiet({ sankalpaSize: size });
  };
  const note = h('span', { class: 'toast', role: 'status' });
  const flash = (msg) => { note.textContent = msg; note.classList.add('show'); setTimeout(() => note.classList.remove('show'), 1800); };
  const tools = h('div', { class: 'tools no-swipe' },
    h('button', { class: 'btn', 'aria-label': 'Smaller text', onclick: () => resize(-0.1) }, 'A−'),
    h('button', { class: 'btn', 'aria-label': 'Larger text', onclick: () => resize(0.1) }, 'A+'),
    h('button', { class: 'btn', onclick: async () => {
      try { await navigator.clipboard.writeText(text); flash('Copied'); } catch { flash('Could not copy'); }
    } }, svg(ICONS.copy), 'Copy'),
    navigator.share ? h('button', { class: 'btn', onclick: () => navigator.share({ text }).catch(() => {}) }, svg(ICONS.share), 'Share') : null,
    note);

  draw();
  root.append(segs, h('div', { class: 'card sankalpa-card' },
    h('p', { class: 'status' }, 'From sunrise, with each change and its time.'), tools, body));
}
