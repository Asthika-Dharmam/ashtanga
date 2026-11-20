// The app: five tabs over one day of one city. The address keeps the tab and the day
// (#ashtanga/2026-11-20), so a day can be shared or bookmarked; with no day, it is today's
// sankalpa day (yesterday's until this morning's sunrise).
import { h, svg, isDate, addDays, nowIn, fmtTime, loadSettings, saveSettings, longDate } from './util.js';
import * as data from './data.js';
import { renderPanchanga } from './view-panchanga.js';
import { renderAshtanga } from './view-ashtanga.js';
import { renderSankalpa } from './view-sankalpa.js';
import { renderFestivals } from './view-festivals.js';
import { renderAbout } from './view-about.js';
import { renderAshtangam } from './view-ashtangam.js';
import { ICONS } from './icons.js';

const TABS = [
  { id: 'panchanga', label: 'Panchanga', sa: 'pañcāṅgam', render: renderPanchanga, dated: true },
  { id: 'ashtanga', label: 'Ashtanga', sa: 'aṣṭāṅgam', render: renderAshtanga, dated: true },
  { id: 'sankalpa', label: 'Sankalpa', sa: 'saṅkalpaḥ', render: renderSankalpa, dated: true },
  { id: 'festivals', label: 'Festivals', sa: 'parvāṇi', render: renderFestivals, dated: false },
  { id: 'about', label: 'About', sa: 'paricayaḥ', render: renderAbout, dated: false },
  // A page reached from About and the Ashtanga tab, not a tab of its own.
  { id: 'ashtangam', label: 'What is the Ashtangam', render: renderAshtangam, dated: false, under: 'about' },
];

const settings = Object.assign({ city: 'Chennai', script: 'devanagari', theme: 'auto', size: 1, twelve: false }, loadSettings());
let index;
const main = document.getElementById('main');
const header = document.getElementById('top');
const tabbar = document.getElementById('tabs');

function applyTheme() {
  const root = document.documentElement;
  if (settings.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', settings.theme);
  root.style.setProperty('--text-scale', settings.size);
  root.dataset.script = settings.script;
}

function parseHash() {
  const [tab, date] = location.hash.replace(/^#\/?/, '').split('/');
  return { tab: TABS.some((t) => t.id === tab) ? tab : 'panchanga', date: isDate(date) ? date : null };
}

function go({ tab, date } = {}) {
  const cur = parseHash();
  const t = tab || cur.tab;
  const d = date === undefined ? cur.date : date;
  const next = `#${t}${d ? '/' + d : ''}`;
  if (location.hash === next) render();
  else location.hash = next;
}

function save(patch) {
  Object.assign(settings, patch);
  saveSettings(settings);
  applyTheme();
  render();
}

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const { tab, date: asked } = parseHash();
  const city = index.cities.find((c) => c.id === settings.city) || index.cities[0];
  const script = index.scripts.includes(settings.script) ? settings.script : 'devanagari';
  const now = nowIn(city.tz);
  const live = await data.sankalpaDay(city, now);
  const r = data.range(city);
  let date = asked || live.date;
  if (date < r.start) date = r.start;
  if (date > r.end) date = r.end;
  const S = await data.loadScript(script);
  if (seq !== renderSeq) return;
  const T = (m) => fmtTime(m, settings.twelve);
  const ctx = {
    index, city, script, S, A: S.ashtanga, F: S.fest, date, live, now, settings, T, go, save, range: r,
    loadDay: (d) => data.loadDay(city, d),
    loadYear: (k) => data.loadYear(city, k),
    yearFor: (d) => data.yearFor(city, d),
  };
  const spec = TABS.find((t) => t.id === tab);
  drawHeader(ctx, spec);
  drawTabs(spec.under || tab);
  const view = h('div', { class: `view view-${tab}` });
  try {
    await spec.render(ctx, view);
  } catch (e) {
    console.error(e);
    view.replaceChildren(h('p', { class: 'empty' }, 'This day could not be shown. ', h('button', { class: 'link', onclick: () => go({ date: null }) }, 'Go to today')));
  }
  if (seq !== renderSeq) return;
  main.replaceChildren(view);
  view.scrollTop = 0;
  document.title = `${spec.label} · Ashtanga`;
  data.prefetch(city, script);
}

function drawHeader(ctx, spec) {
  const { city, index: ix, date, live, range } = ctx;
  const cityPick = h('label', { class: 'city' },
    svg(ICONS.pin),
    h('select', { 'aria-label': 'City', onchange: (e) => save({ city: e.target.value }) },
      ix.cities.map((c) => h('option', { value: c.id, selected: c.id === city.id }, c.label))));
  const top = h('div', { class: 'bar' },
    h('a', { class: 'brand', href: '#panchanga' }, h('img', { src: 'icons/icon.svg', alt: '', width: 28, height: 28 }),
      h('span', null, h('b', null, 'Ashtanga'), h('small', null, 'Asthika Dharmam'))),
    h('div', { class: 'picks' }, cityPick,
      // Settings: the About tab, at its Settings card.
      h('a', { class: 'gear', href: '#about/settings', 'aria-label': 'Settings', title: 'Settings',
        onclick: () => { if (location.hash === '#about/settings') document.getElementById('settings')?.scrollIntoView({ block: 'start' }); } }, svg(ICONS.gear))));
  const rows = [top];
  if (spec.dated) {
    const isLive = date === live.date;
    const dateInput = h('input', {
      type: 'date', class: 'date-input', value: date, min: range.start, max: range.end, 'aria-label': 'Pick a date',
      onchange: (e) => e.target.value && go({ date: e.target.value }),
    });
    rows.push(h('div', { class: 'datebar' },
      h('button', { class: 'nav', 'aria-label': 'Previous day', disabled: date <= range.start, onclick: () => go({ date: addDays(date, -1) }) }, svg(ICONS.left)),
      h('label', { class: 'date-label' }, h('span', null, longDate(date)), dateInput),
      h('button', { class: 'nav', 'aria-label': 'Next day', disabled: date >= range.end, onclick: () => go({ date: addDays(date, 1) }) }, svg(ICONS.right)),
      h('button', { class: 'today-btn' + (isLive ? ' on' : ''), onclick: () => go({ date: null }) }, 'Today')));
  }
  header.replaceChildren(...rows);
}

function drawTabs(current) {
  tabbar.replaceChildren(...TABS.filter((t) => !t.under).map((t) => h('a', {
    href: `#${t.id}${t.dated && parseHash().date ? '/' + parseHash().date : ''}`,
    class: 'tab' + (t.id === current ? ' on' : ''),
    'aria-current': t.id === current ? 'page' : null,
  }, svg(ICONS[t.id]), h('span', null, t.label))));
}

// Swipe left/right on a dated tab to change the day.
let touch = null;
main.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1 || e.target.closest('.no-swipe, input, select, textarea')) { touch = null; return; }
  touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
main.addEventListener('touchend', (e) => {
  if (!touch) return;
  const dx = e.changedTouches[0].clientX - touch.x;
  const dy = e.changedTouches[0].clientY - touch.y;
  touch = null;
  const { tab, date } = parseHash();
  if (!TABS.find((t) => t.id === tab).dated || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
  const cur = date || document.querySelector('.date-input')?.value;
  if (cur) go({ date: addDays(cur, dx < 0 ? 1 : -1) });
});
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const { tab } = parseHash();
  const cur = document.querySelector('.date-input')?.value;
  if (!cur || !TABS.find((t) => t.id === tab).dated) return;
  if (e.key === 'ArrowLeft') go({ date: addDays(cur, -1) });
  if (e.key === 'ArrowRight') go({ date: addDays(cur, 1) });
});

// Redraw when the day turns over at sunrise, or the page comes back after a while.
let lastLive = null;
async function tick() {
  if (!index) return;
  const city = index.cities.find((c) => c.id === settings.city) || index.cities[0];
  const live = await data.sankalpaDay(city, nowIn(city.tz));
  if (lastLive && live.date !== lastLive && !parseHash().date) render();
  lastLive = live.date;
}
setInterval(tick, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

window.addEventListener('hashchange', render);
applyTheme();
data.loadIndex().then((ix) => {
  index = ix;
  render();
  tick();
}).catch((e) => {
  main.replaceChildren(h('p', { class: 'empty' }, 'The data could not be loaded. Check the connection and reload.'));
  console.error(e);
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
