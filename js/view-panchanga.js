// Panchanga: the day at a glance. The five angas with when each ends and what follows, the sun and
// moon, the times to keep clear of and the good ones, and the day's festivals of both kinds.
import { h, svg, span, moonIcon } from './util.js';
import { ICONS } from './icons.js';
import { festivalsOf } from './festivals.js';

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

  // Times to keep clear of, and the good ones.
  const timeRow = (label, val, now) => h('li', { class: now ? 'now' : '' }, h('span', null, label), h('time', null, val));
  const inSpan = (a, b) => t != null && t >= a && t < b;
  const TYAJYA = { ti: 'tithi', na: 'nakṣatra', vaa: 'vāra' };
  const avoid = [
    ['Rāhu kālam', day.raahu],
    ['Yamagaṇḍam', day.yama],
    ['Gulika kālam', day.gulika],
    ...(day.durmuhurta || []).map((s) => ['Durmuhūrtam', s]),
    ...(day.tyajya || []).map(([a, b, k]) => [`Varjyam (${TYAJYA[k] || k} tyājyam)`, [a, b]]),
  ].filter(([, s]) => s);
  const good = [
    ['Abhijit muhūrtam', day.abhijit],
    ...(day.amrta || []).map((s) => ['Amṛta kālam', s]),
  ].filter(([, s]) => s);
  const times = h('section', { class: 'card times' },
    h('div', { class: 'col avoid' }, h('h2', null, svg(ICONS.avoid), 'To avoid'),
      h('ul', null, avoid.map(([l, [a, b]]) => timeRow(l, span(a, b, ctx.settings.twelve), inSpan(a, b))))),
    h('div', { class: 'col good' }, h('h2', null, svg(ICONS.good), 'Auspicious'),
      h('ul', null, good.map(([l, [a, b]]) => timeRow(l, span(a, b, ctx.settings.twelve), inSpan(a, b))))));

  // The moon's rashi, shula and the day's amritadi yoga.
  const [r1, rEnd] = day.rashi;
  const moonRashi = rEnd != null ? `${S.rashi[r1]} (till ${T(rEnd)}) → ${S.rashi[(r1 % 12) + 1]}` : S.rashi[r1];
  const shula = S.shula[day.wd];
  const more = h('section', { class: 'card facts' },
    h('dl', null,
      h('div', null, h('dt', null, 'Moon in'), h('dd', { lang: 'sa' }, moonRashi)),
      shula ? h('div', null, h('dt', null, 'Śūlam · parihāram'), h('dd', { lang: 'sa' }, `${shula[0]} · ${shula[1]}`)) : null,
      day.amritadi?.length ? h('div', null, h('dt', null, 'Yoga of the day'), h('dd', { lang: 'sa' }, day.amritadi.map((k) => S.amritadi[k] || k).join(', '))) : null));

  const { ashtanga, panchanga } = festivalsOf(ctx, day);
  const fest = (ashtanga.length || panchanga.length) ? h('section', { class: 'card fests' },
    h('h2', null, 'Today’s festivals'),
    ashtanga.length ? h('ul', { class: 'fest-list a' }, ashtanga.map((f) => h('li', { lang: 'sa' }, f.name))) : null,
    panchanga.length ? h('ul', { class: 'fest-list p' }, panchanga.map((f) => h('li', { lang: 'sa' }, f.name))) : null) : null;

  root.append(head, fest, angas, times, more,
    h('p', { class: 'foot' }, 'Times for ', ctx.city.label, ' (', ctx.city.tz, '). A * marks a time after midnight, before the next sunrise.'));
}
