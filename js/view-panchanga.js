// Panchanga: the day at a glance. The five angas with when each ends and what follows, the sun and
// moon, rAhu, yama and gulika or the five kAlas of the day, and the day's festivals of both kinds.
import { h, svg, span, moonIcon, saveSettings } from './util.js';
import { ICONS } from './icons.js';
import { festivalsOf, festLabel } from './festivals.js';

// One anga: each span from sunrise, with its end, and what runs at the next sunrise.
function angaRow(label, names, spans, ctx, t, extra) {
  const items = spans.map(([id, end], i) => {
    const prevEnd = i ? spans[i - 1][1] : -Infinity;
    const running = t != null && t >= prevEnd && (end == null || t < end);
    return h('li', { class: running ? 'now' : '' },
      h('span', { class: 'nm', lang: 'sa' }, names[id] ?? id),
      end != null ? h('span', { class: 'till' }, 'till ', h('time', null, ctx.T(end))) : h('span', { class: 'till' }, i ? 'after' : 'all day'));
  });
  return h('section', { class: 'anga' }, h('h3', null, label, extra), h('ul', null, items));
}

export async function renderPanchanga(ctx, root) {
  const got = await ctx.loadDay(ctx.date);
  if (!got) return root.append(h('p', { class: 'empty' }, 'No data for this day.'));
  const { day, year } = got;
  const { S, T } = ctx;
  const isLive = ctx.date === ctx.live.date;
  const t = isLive ? ctx.live.t : null;
  const tithi0 = (day.tithi.find(([, e]) => t == null || e == null || e > t) || day.tithi[0])[0];

  // The year, season and months, as the sankalpa has them.
  const saura = `${S.rashi[day.saura.m]} ${day.saura.d}`;
  const head = h('section', { class: 'hero card' },
    h('div', { class: 'hero-top' },
      moonIcon(tithi0, 44),
      h('div', null,
        h('div', { class: 'vara', lang: 'sa' }, S.vara[day.wd], ' ', h('span', { class: 'muted' }, '·'), ' ', S.tithi[tithi0]),
        h('div', { class: 'year', lang: 'sa' }, S.samvatsara[year.samvatsara], ' · ', S.ayana[day.saura.m], ' · ', S.rtu[day.saura.m]))),
    h('dl', { class: 'months' },
      h('div', null, h('dt', null, 'Solar month'), h('dd', { lang: 'sa' }, saura,
        day.saura.end ? h('small', null, ` (${S.rashi[day.saura.end[0]]} till ${T(day.saura.end[1])})`) : null)),
      h('div', null, h('dt', null, 'Lunar month'), h('dd', { lang: 'sa' }, S.chandramasa[String(day.chandra)] || '—'))),
    h('div', { class: 'sky' },
      h('span', null, svg(ICONS.sunrise), h('time', null, T(day.sun[0]))),
      h('span', null, svg(ICONS.sunset), h('time', null, T(day.sun[1]))),
      day.moon ? h('span', { title: 'Moonrise / moonset' }, svg(ICONS.moonrise),
        h('time', null, T(day.moon[0])), ' / ', h('time', null, T(day.moon[1]))) : null));

  const angas = h('section', { class: 'card angas' },
    h('h2', null, 'Pañcāṅga', isLive ? h('span', { class: 'pill live' }, 'now') : null),
    angaRow('Tithi', S.tithi, day.tithi, ctx, t),
    h('section', { class: 'anga' }, h('h3', null, 'Vāra'), h('ul', null, h('li', null, h('span', { class: 'nm', lang: 'sa' }, S.vara[day.wd])))),
    angaRow('Nakṣatra', S.nakshatra, day.nakshatra, ctx, t),
    angaRow('Yoga', S.yoga, day.yoga, ctx, t),
    angaRow('Karaṇa', S.karana, day.karana, ctx, t));

  // The day's times, in two tabs: rAhu, yama and gulika; and the five kAlas of the day and the
  // dinAnta (from the panchaanga; prAtaH begins at sunrise, sAyAhna ends at sunset).
  const timeRow = (label, val, now, sa) => h('li', { class: now ? 'now' : '' }, h('span', sa ? { lang: 'sa' } : null, label), h('time', null, val));
  const inSpan = (a, b) => t != null && t >= a && t < b;
  const twelve = ctx.settings.twelve;
  const avoid = [['Rāhu kālam', day.raahu], ['Yamagaṇḍam', day.yama], ['Gulika kālam', day.gulika]].filter(([, x]) => x);
  const K = S.kaala || {};
  const k = day.kala || {};
  const bounds = [day.sun[0], k.saangava, k.madhyaahna, k.aparaahna, k.saayaahna, day.sun[1]];
  const kalas = ['praatah', 'saangava', 'madhyaahna', 'aparaahna', 'saayaahna']
    .map((id, n) => [K[id] || id, [bounds[n], bounds[n + 1]]]).filter(([, [a, b]]) => a != null && b != null);
  const lists = {
    avoid: h('ul', null, avoid.map(([l, [a, b]]) => timeRow(l, span(a, b, twelve), inSpan(a, b)))),
    kala: h('ul', null, kalas.map(([l, [a, b]]) => timeRow(l, span(a, b, twelve), inSpan(a, b), true)),
      k.dinaanta != null ? timeRow(K.dinaanta || 'dinaanta', T(k.dinaanta), false, true) : null),
  };
  let shown = ctx.settings.timesTab === 'kala' ? 'kala' : 'avoid';
  const body = h('div', { class: 'times-body' });
  const tabs = h('div', { class: 'segs small no-swipe', role: 'tablist' });
  const drawTimes = () => {
    tabs.replaceChildren(...[['avoid', 'To avoid'], ['kala', 'Kālas']].map(([id, label]) => h('button', {
      class: 'seg' + (shown === id ? ' on' : ''), role: 'tab', 'aria-selected': String(shown === id),
      onclick: () => { shown = id; ctx.settings.timesTab = id; saveSettings(ctx.settings); drawTimes(); },
    }, label)));
    body.replaceChildren(lists[shown]);
  };
  drawTimes();
  const times = h('section', { class: 'card times' }, tabs, body);

  const { ashtanga, panchanga } = festivalsOf(ctx, day);
  const fest = (ashtanga.length || panchanga.length) ? h('section', { class: 'card fests' },
    h('h2', null, 'Today’s festivals'),
    ashtanga.length ? h('ul', { class: 'fest-list a' }, ashtanga.map((f) => h('li', { lang: 'sa', class: f.kind }, festLabel(h, ctx, f)))) : null,
    panchanga.length ? h('ul', { class: 'fest-list p' }, panchanga.map((f) => h('li', { lang: 'sa' }, f.name))) : null) : null;

  root.append(head, fest, angas, times,
    h('p', { class: 'foot' }, 'Times for ', ctx.city.label, ' (', ctx.city.tz, '). A * marks a time after midnight, before the next sunrise.'));
}
