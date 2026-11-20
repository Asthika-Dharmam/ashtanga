// Sankalpa: the Shakta Ashtanga sankalpa (as the Telegram bot and the Ashtangam print it) and the
// panchanga sankalpa (the panchaanga's, js/sankalpa.js), in large type that can be made larger, to
// copy or share. On the day that is running now each is the sankalpa for the moment, redrawn when an
// anga changes; or, when the reader chooses, as printed, from sunrise, with the changes in brackets.
import { h, svg, rich, plain, addDays, nowIn, saveSettings } from './util.js';
import { ICONS } from './icons.js';
import { ashtanga, ashtangaSankalpa, vidya } from './ashtanga.js';
import { sankalpaText, sankalpaAt } from './sankalpa.js';
import { sankalpaDay } from './data.js';

export async function renderSankalpa(ctx, root) {
  const got = await ctx.loadDay(ctx.date);
  if (!got) return root.append(h('p', { class: 'empty' }, 'No data for this day.'));
  const { day, year } = got;
  const { A, S, T, settings } = ctx;
  const K = S.sankalpa;
  const P = A.phrases;
  const a = ashtanga(day);
  const nextDay = day.tithi.some(([id, end]) => id === 30 && end != null) ? (await ctx.loadDay(addDays(day.date, 1)))?.day : null;

  let which = settings.sankalpaWhich || 'ashtanga';
  let fromSunrise = !!settings.sankalpaSunrise;
  let size = Number(settings.sankalpaSize) || 1.2;
  let text = '';
  let until = null;
  const quiet = (patch) => { Object.assign(settings, patch); saveSettings(settings); };

  // Minutes after this day's midnight, if now falls within it (sunrise to sunrise).
  const nowT = async () => {
    const live = await sankalpaDay(ctx.city, nowIn(ctx.city.tz));
    return live.date === day.date ? live.t : null;
  };

  const body = h('article', { class: 'sankalpa', lang: 'sa', style: `font-size:${size}rem` });
  const status = h('p', { class: 'status' });
  const seg = (id, label) => h('button', { class: 'seg', 'data-id': id, 'aria-pressed': String(which === id), onclick: () => { which = id; quiet({ sankalpaWhich: id }); draw(); } }, label);
  const segs = h('div', { class: 'segs no-swipe', role: 'group', 'aria-label': 'Which sankalpa' },
    seg('ashtanga', 'Śākta Aṣṭāṅga'), seg('panchanga', 'Pañcāṅga'));
  const sunriseBox = h('input', { type: 'checkbox', checked: fromSunrise, onchange: (e) => { fromSunrise = e.target.checked; quiet({ sankalpaSunrise: fromSunrise }); draw(); } });
  const sunriseOpt = h('label', { class: 'check' }, sunriseBox, ' As printed, from sunrise');

  async function draw() {
    for (const b of segs.children) { const on = b.dataset.id === which; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }
    const t = await nowT();
    const live = t != null && !fromSunrise;
    sunriseOpt.hidden = t == null;
    let lines;
    if (which === 'ashtanga') {
      lines = [`*${P.title}*`, ...ashtangaSankalpa(A, a, T, live ? t : null, day), `*${P.vidyA}* – ${vidya(A, a)}`];
      // In the Ashtanga only the tithinityA changes in the day.
      until = live ? (day.tithi.find(([, e]) => e != null && e > t && e < day.next_sunrise) || [])[1] ?? null : null;
    } else {
      let parts;
      if (live) ({ text: parts, until } = sankalpaAt(day, year.samvatsara, K, t, nextDay?.chandra));
      else { parts = sankalpaText(day, year.samvatsara, K, T); until = null; }
      lines = [`*${P.panca_title}*`, P.panca_head, ...parts.split('\t').map((p) => p.trim()).filter(Boolean)];
    }
    text = lines.map(plain).join('\n');
    body.replaceChildren(...lines.map((l, i) => h('p', { class: i ? '' : 'title' }, rich(l))));
    status.replaceChildren(live
      ? h('span', null, h('span', { class: 'pill live' }, 'now'), until != null ? ` until ${T(until)}, when an aṅga changes` : ' for the rest of this day')
      : t != null ? 'As printed: from sunrise, with each change and its time.' : day.date < (await sankalpaDay(ctx.city, nowIn(ctx.city.tz))).date ? 'A past day, as printed from sunrise.' : 'A coming day, as printed from sunrise.');
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

  await draw();
  // Redraw when the moment's sankalpa changes, or the day ends.
  const timer = setInterval(async () => {
    if (!body.isConnected) return clearInterval(timer);
    const t = await nowT();
    if ((until != null && t != null && t >= until) || (t == null) !== sunriseOpt.hidden) draw();
  }, 20000);

  root.append(segs, h('div', { class: 'card sankalpa-card' }, h('div', { class: 'sk-head' }, status, sunriseOpt), tools, body));
}
