// Festivals: the Kali year's festivals, Ashtanga or Panchanga, by month, opening at the next one.
import { h, parseDate, WD3, MON, saveSettings } from './util.js';
import { festivalsOf } from './festivals.js';

const KINDS = [['all', 'All'], ['parva', 'Parvas'], ['mahavidya', 'Mahāvidyās'], ['navaratri', 'Navarātras'], ['visesha', 'Viśeṣa puṇyakālas']];

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
      onclick: () => { which = id; kind = 'all'; settings.festWhich = id; saveSettings(settings); draw(); },
    }, label)));
    chips.hidden = which !== 'ashtanga';
    search.hidden = which !== 'panchanga';
    chips.replaceChildren(...KINDS.map(([id, label]) => h('button', { class: 'chip' + (kind === id ? ' on' : ''), onclick: () => { kind = id; draw(); } }, label)));

    // date → names
    const rows = [];
    for (const d of year.days) {
      // A year's first day is also the previous year's last; it belongs to the later year.
      if (d.date === year.end && city.years[i + 1]) continue;
      const f = festivalsOf(ctx, d)[which].filter((x) => (kind === 'all' || x.kind === kind)
        && (!query || x.name.toLowerCase().includes(query) || x.key.toLowerCase().includes(query)));
      if (f.length) rows.push([d.date, f]);
    }
    const out = [];
    let month = null;
    let ul = null;
    for (const [date, f] of rows) {
      const dt = parseDate(date);
      const m = date.slice(0, 7);
      if (m !== month) {
        month = m;
        out.push(h('h3', { class: 'month' }, `${MON[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`));
        out.push(ul = h('ul', { class: 'fest-rows' }));
      }
      ul.append(h('li', { class: date < live ? 'past' : date === live ? 'today' : '', 'data-date': date },
        h('button', { class: 'row-date', onclick: () => ctx.go({ tab: which === 'ashtanga' ? 'ashtanga' : 'panchanga', date }) },
          h('b', null, dt.getUTCDate()), h('small', null, WD3[dt.getUTCDay()])),
        h('div', { class: 'row-names', lang: 'sa' }, f.map((x) => h('span', { class: `fn ${x.kind}` }, x.name)))));
    }
    list.replaceChildren(...(out.length ? out : [h('p', { class: 'empty' }, 'Nothing here.')]));
    const next = list.querySelector('li.today, li:not(.past)');
    if (next && next !== list.querySelector('li')) requestAnimationFrame(() => next.scrollIntoView({ block: 'center' }));
  }

  root.append(h('div', { class: 'fest-head card' }, yearBar, segs, chips, search), list);
  await draw();
}
