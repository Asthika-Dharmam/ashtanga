// Festivals: the Kali year's festivals, Ashtanga or Panchanga, by month, opening at the next one;
// the months already past folded away. Each list can be narrowed to a class: the Ashtanga's by kind,
// the Panchanga's by the panchaanga's festival groups (data/index.json → groups).
import { h, parseDate, WD3, MON, saveSettings } from './util.js';
import { festivalsOf, festLabel } from './festivals.js';

const KINDS = {
  ashtanga: [['all', 'All'], ['parva', 'Parvas'], ['mahavidya', 'Mahāvidyās'], ['navaratri', 'Navarātras'], ['visesha', 'Viśeṣa puṇyakālas']],
  panchanga: [['all', 'All'], ['EkAdazI-vrata', 'Ekādaśī'], ['pradOSa-vrata', 'Pradoṣa'],
    ['kAJcI-jagadgurUNAM ArAdhanA/jayantI', 'Jagadguru ārādhanā / jayantī'], ['zivarAtri', 'Śivarātri'],
    ['saGkaTahara-caturthI-vrata', 'Saṅkaṭahara caturthī'], ['SaSThI-vrata', 'Ṣaṣṭhī'], ['darza-zrAddha', 'Amāvāsyā'],
    ['pUrNimA', 'Pūrṇimā'], ['saGkramaNa', 'Saṅkramaṇa'], ['amRta-siddhi-yOga', 'Amṛta-siddhi yoga'],
    ['candra-grahaNa', 'Candra-grahaṇa'], ['sUrya-grahaNa', 'Sūrya-grahaṇa']],
};
const inKind = (which, kind, x) => kind === 'all' || (which === 'ashtanga' ? x.kind === kind : x.groups.includes(kind));

export async function renderFestivals(ctx, root) {
  const { city, settings } = ctx;
  const live = ctx.live.date;
  let kali = Number(settings.festKali) && city.years.some((y) => y.kali === Number(settings.festKali))
    ? Number(settings.festKali) : (ctx.yearFor(live) || city.years[0]).kali;
  let which = settings.festWhich || 'ashtanga';
  let kind = 'all';
  let query = '';

  const list = h('div', { class: 'fest-year' });
  const yearBar = h('div', { class: 'yearbar no-swipe' });
  const segs = h('div', { class: 'segs no-swipe', role: 'group', 'aria-label': 'Which festivals' });
  const chips = h('div', { class: 'chips filter no-swipe' });
  const search = h('input', { type: 'search', class: 'search', placeholder: 'Search festivals', 'aria-label': 'Search festivals',
    oninput: (e) => { query = e.target.value.trim().toLowerCase(); draw(); } });

  async function draw() {
    const year = await ctx.loadYear(kali);
    const i = city.years.findIndex((y) => y.kali === kali);
    yearBar.replaceChildren(
      h('button', { class: 'nav', disabled: i <= 0, 'aria-label': 'Previous year', onclick: () => { kali = city.years[i - 1].kali; draw(); } }, '‹'),
      h('span', null, h('b', { lang: 'sa' }, ctx.S.samvatsara[year.samvatsara]), h('small', null, ` Kali ${kali} · ${year.start.slice(0, 4)}–${year.end.slice(2, 4)}`)),
      h('button', { class: 'nav', disabled: i >= city.years.length - 1, 'aria-label': 'Next year', onclick: () => { kali = city.years[i + 1].kali; draw(); } }, '›'));
    segs.replaceChildren(...[['ashtanga', 'Ashtanga'], ['panchanga', 'Panchanga']].map(([id, label]) => h('button', {
      class: 'seg' + (which === id ? ' on' : ''), 'aria-pressed': String(which === id),
      onclick: () => { which = id; kind = 'all'; query = ''; search.value = ''; settings.festWhich = id; saveSettings(settings); draw(); },
    }, label)));
    search.hidden = which !== 'panchanga';

    // The year's festivals, date by date; then those of the chosen class and search.
    const all = [];
    for (const d of year.days) {
      // A year's first day is also the previous year's last; it belongs to the later year.
      if (d.date === year.end && city.years[i + 1]) continue;
      const f = festivalsOf(ctx, d)[which];
      if (f.length) all.push([d.date, f]);
    }
    const count = (k) => all.reduce((n, [, f]) => n + f.filter((x) => inKind(which, k, x)).length, 0);
    chips.replaceChildren(...KINDS[which].filter(([id]) => id === 'all' || count(id)).map(([id, label]) => h('button', {
      class: 'chip' + (kind === id ? ' on' : ''), onclick: () => { kind = id; draw(); },
    }, label, id === 'all' ? null : h('span', { class: 'n' }, count(id)))));
    const rows = all.map(([date, f]) => [date, f.filter((x) => inKind(which, kind, x)
      && (!query || x.name.toLowerCase().includes(query) || x.key.toLowerCase().includes(query)))])
      .filter(([, f]) => f.length);
    // By month; a month already past is folded, with its count, and opens on a tap.
    const out = [];
    let month = null;
    let ul = null;
    const thisMonth = live.slice(0, 7);
    for (const [date, f] of rows) {
      const dt = parseDate(date);
      const m = date.slice(0, 7);
      if (m !== month) {
        month = m;
        const title = `${MON[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
        ul = h('ul', { class: 'fest-rows' });
        if (m < thisMonth) {
          const n = rows.filter(([d]) => d.startsWith(m)).length;
          out.push(h('details', { class: 'past-month' }, h('summary', { class: 'month' }, title, h('span', { class: 'n' }, `${n} day${n === 1 ? '' : 's'}`)), ul));
        } else {
          out.push(h('h3', { class: 'month' }, title), ul);
        }
      }
      ul.append(h('li', { class: date < live ? 'past' : date === live ? 'today' : '', 'data-date': date },
        h('button', { class: 'row-date', onclick: () => ctx.go({ tab: which === 'ashtanga' ? 'ashtanga' : 'panchanga', date }) },
          h('b', null, dt.getUTCDate()), h('small', null, WD3[dt.getUTCDay()])),
        h('div', { class: 'row-names', lang: 'sa' }, f.map((x) => h('span', { class: `fn ${x.kind}` }, festLabel(h, ctx, x))))));
    }
    list.replaceChildren(...(out.length ? out : [h('p', { class: 'empty' }, 'Nothing here.')]));
    const next = list.querySelector('li.today, li:not(.past)');
    if (next && next !== list.querySelector('li')) requestAnimationFrame(() => next.scrollIntoView({ block: 'center' }));
  }

  root.append(h('div', { class: 'fest-head card' }, yearBar, segs, chips, search), list);
  await draw();
}
