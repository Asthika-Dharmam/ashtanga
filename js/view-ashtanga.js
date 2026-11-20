// Ashtanga: the day's Shakta Ashtanga, as the right-hand pages of the Ashtangam print it, with the
// dinanityAvidyA large, then the year's cycles, then the days ahead.
import { h, svg, shortDate, parseDate, WD3 } from './util.js';
import { ICONS } from './icons.js';
import { ashtanga, vidya, tithiAt } from './ashtanga.js';
import { festivalsOf, isNavavarana, inNavaratri, festLabel } from './festivals.js';

const row = (label, ...value) => h('div', { class: 'row' }, h('dt', { lang: 'sa' }, label), h('dd', { lang: 'sa' }, ...value));

export async function renderAshtanga(ctx, root) {
  const got = await ctx.loadDay(ctx.date);
  if (!got) return root.append(h('p', { class: 'empty' }, 'No data for this day.'));
  const { day, year } = got;
  const { A, T } = ctx;
  const L = A.labels;
  const a = ashtanga(day);
  const isLive = ctx.date === ctx.live.date;
  const t = isLive ? ctx.live.t : null;
  const nowTithi = t != null ? tithiAt(day, t) : null;
  const fests = festivalsOf(ctx, day, a).ashtanga;
  const navavarana = isNavavarana(fests, inNavaratri(year.days, day.date));

  const hero = h('section', { class: 'card hero vidya-card' },
    h('div', { class: 'eyebrow', lang: 'sa' }, L.vidyA),
    h('div', { class: 'vidya', lang: 'sa' }, vidya(A, a)),
    h('div', { class: 'chips' },
      h('span', { class: 'chip' }, 'Kalyahargaṇa ', h('b', null, a.k.toLocaleString('en-IN'))),
      h('span', { class: 'chip' }, 'Tattva-divasa ', h('b', null, `${a.divasaNo}/36`)),
      navavarana ? h('span', { class: 'chip gold' }, svg(ICONS.ashtanga), h('span', { lang: 'sa' }, A.phrases.navavarana)) : null),
    fests.length ? h('ul', { class: 'fest-list a' }, fests.map((f) => h('li', { lang: 'sa', class: f.kind }, festLabel(h, ctx, f)))) : null);

  const tithis = a.tithis.map(({ id, end }) => h('span', { class: 'tn' + (nowTithi === id ? ' now' : '') },
    A.nitya30[id - 1], end != null ? h('small', null, ` till ${T(end)}`) : null));

  const dayCard = h('section', { class: 'card ash' },
    h('h2', null, 'This day', isLive ? h('span', { class: 'pill live' }, 'now') : null),
    h('dl', null,
      row(L.tithinityA, h('span', { class: 'stack' }, tithis)),
      row(L.dinanityA, A.nitya30[a.dinanitya]),
      row(L.kAlanityA, A.kalanitya[a.kalanitya]),
      row(L.divasa, A.tattva[a.divasa]),
      row(L.vAsara, A.vasara[a.vasara]),
      h('div', { class: 'row letters' },
        h('dt', { lang: 'sa' }, `${L.nakSatra} · ${L.yOga} · ${L.karaNa}`),
        h('dd', { lang: 'sa' }, h('span', { class: 'lt' }, A.nakshatra[a.letter]), h('span', { class: 'lt' }, A.yoga[a.letter]), h('span', { class: 'lt' }, A.karana[a.letter]))),
      row(L.ghaTikOdaya, A.ghatika[a.ghatika]),
      a.visesha.length ? row(L.vizESa, a.visesha.map((v) => A.visesha[v][0]).join(', ')) : null));

  const cycles = h('section', { class: 'card ash' },
    h('h2', null, 'Months and years'),
    h('dl', null,
      row(L.vatsara, A.tattva[a.vatsara]),
      row(L.Rtu, A.rtu[a.rtu]),
      row(L.nityAmAsa, A.nityamasa[a.nityamasa]),
      row(L.kalAmAsa, A.kalamasa[a.kalamasa])),
    h('details', null, h('summary', null, 'The larger cycles'),
      h('dl', null,
        row(L.parivRtti, A.tattva[a.parivritti]),
        row(L.yuga, A.tattva[a.yuga]),
        row(L.mahAyuga, A.tattva[a.mahayuga]),
        row(L.kalpa, A.tattva[a.kalpa]),
        row(L.mahAkalpa, A.tattva[a.mahakalpa]))));

  // The next seven days, as rows: tithinityA at sunrise, dinanityA, vidyA, and any festival.
  const ahead = [];
  for (const d of year.days) {
    if (d.date <= day.date) continue;
    if (ahead.length >= 7) break;
    const x = ashtanga(d);
    const f = festivalsOf(ctx, d, x).ashtanga;
    const dt = parseDate(d.date);
    ahead.push(h('li', null, h('button', { class: 'ahead-row', onclick: () => ctx.go({ date: d.date }) },
      h('span', { class: 'when' }, h('b', null, shortDate(d.date)), h('small', null, WD3[dt.getUTCDay()])),
      h('span', { class: 'what', lang: 'sa' },
        h('span', null, A.nitya30[x.tithis[0].id - 1], ' · ', A.nitya30[x.dinanitya]),
        h('span', { class: 'v' }, vidya(A, x)),
        f.length ? h('span', { class: 'f' }, f.map((y) => y.name).join(' · ')) : null))));
  }
  const next = ahead.length ? h('section', { class: 'card ahead' }, h('h2', null, 'Coming days'), h('ul', null, ahead)) : null;

  root.append(hero, dayCard, cycles, next,
    h('a', { class: 'card more-link', href: '#ashtangam' }, h('b', null, 'What is the Ashtangam?'),
      h('small', null, 'Śrī Kāñcī Mahāsvāmī\u2019s direction, April 1973')));
}
