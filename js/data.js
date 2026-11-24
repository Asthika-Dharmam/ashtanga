// The app's data: static JSON under data/, made by tools/build_data.py from the panchaanga's
// published data. Fetched once and kept in memory; the service worker keeps a copy for offline use.
import { addDays } from './util.js';

// index.json is always asked of the network first (sw.js); every other file is asked for under its
// build (?b=…), so a new data build is fetched afresh and an old one is never served in its place.
const cache = new Map();
let build = '';
function get(path) {
  if (!cache.has(path)) {
    const url = 'data/' + path + (path !== 'index.json' && build ? `?b=${build}` : '');
    const p = fetch(url, path === 'index.json' ? { cache: 'no-cache' } : undefined).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return cache.get(path);
}

export const loadIndex = () => get('index.json').then((ix) => {
  const b = ix.build || {};
  build = [b.date, b.jyotisha, b.adyatithi, b.adyatithi_panchaanga].filter(Boolean).join('.');
  return ix;
});
export const loadScript = (script) => get(`s/${script}.json`);

// A Kali year of a city: {kali, samvatsara, start, end, days, byDate}.
export async function loadYear(city, kali) {
  const y = await get(`c/${city.id}/${kali}.json`);
  if (!y.byDate) y.byDate = new Map(y.days.map((d) => [d.date, d]));
  return y;
}

// The Kali year whose days hold a date. The first day of a year is also the last of the previous
// one; the later year wins, as in the panchaanga.
export function yearFor(city, date) {
  const hits = city.years.filter((y) => y.start <= date && date <= y.end);
  return hits.length ? hits[hits.length - 1] : null;
}
export const range = (city) => ({ start: city.years[0].start, end: city.years[city.years.length - 1].end });

export async function loadDay(city, date) {
  const yr = yearFor(city, date);
  if (!yr) return null;
  const y = await loadYear(city, yr.kali);
  const day = y.byDate.get(date);
  return day ? { day, year: y } : null;
}

// The day whose sunrise-to-sunrise span holds the moment now: before today's sunrise, it is
// yesterday's. Returns {date, t} with t in minutes after that day's midnight (past 1440 before sunrise).
export async function sankalpaDay(city, now) {
  const today = await loadDay(city, now.date);
  if (today && now.minutes < today.day.sun[0]) {
    const prev = addDays(now.date, -1);
    if (await loadDay(city, prev)) return { date: prev, t: now.minutes + 1440 };
  }
  return { date: now.date, t: now.minutes };
}

// Offline: once the page is up, fetch the rest of this city's years and this script quietly, so the
// service worker has them.
const prefetched = new Set();
export function prefetch(city, script) {
  const key = `${city.id}/${script}`;
  if (prefetched.has(key) || !('serviceWorker' in navigator) || navigator.onLine === false) return;
  prefetched.add(key);
  const run = () => {
    for (const y of city.years) get(`c/${city.id}/${y.kali}.json`).catch(() => {});
    get(`s/${script}.json`).catch(() => {});
  };
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 2000)))(run);
}
