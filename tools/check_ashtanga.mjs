// Checks js/ashtanga.js against an Ashtanga sankalpa ICS made by kamakoti-panchangam's
// write_daily_ashtanga_sankalpa_ics.py (the one the Telegram bot posts), day by day.
//
//   python3 tools/ics2json.py Madrapuri-2026-devanagari-daily-ashtanga-sankalpa.ics /tmp/ics.json
//   node tools/check_ashtanga.mjs /tmp/ics.json Chennai
//
// Allowed for: the spellings this app takes from the Ashtangam PDF and the calculation sheet where
// the ICS's tables differ (अम्/अं, घ्राणं/घ्राणम्, ॐ/ओं ...), and the ICS generator's nityAmElana test,
// which never fires (it compares the tithinityA's last word), and the tithinityA's form: the ICS's
// A (t); B is read as this app's A (t; B ➥). A tithi's end may differ by a minute.
import { readFileSync } from 'node:fs';
import { ashtanga, ashtangaSankalpa, vidya } from '../js/ashtanga.js';

const [, , icsPath, city = 'Chennai'] = process.argv;
const ics = JSON.parse(readFileSync(icsPath, 'utf8'));
const A = JSON.parse(readFileSync(new URL('../data/s/devanagari.json', import.meta.url))).ashtanga;
const index = JSON.parse(readFileSync(new URL('../data/index.json', import.meta.url)));
const days = new Map();
for (const y of index.cities.find((c) => c.id === city).years) {
  const f = JSON.parse(readFileSync(new URL(`../data/c/${city}/${y.kali}.json`, import.meta.url)));
  for (const d of f.days) days.set(d.date, d);
}
const DIG = '०१२३४५६७८९';
const pad = (n) => String(n).padStart(2, '0');
const T = (m) => {
  const star = m >= 1440;
  if (star) m -= 1440;
  return [Math.floor(m / 60), Math.round(m % 60)].map(pad).join(':').replace(/\d/g, (d) => DIG[d]) + (star ? '*' : '');
};
const SPELL = [['अम् आं', 'अं आं'], ['इम् ईं', 'इं ईं'], ['उम् ऊं', 'उं ऊं'], ['ऋम् ॠं', 'ऋं ॠं'], ['एम् ऐं', 'एं ऐं'], ['ओम् औं', 'ओं औं'],
  ['अं अः लक्ष्मी*', 'अं अः लक्ष्मीः*'], ['घ्राणं', 'घ्राणम्'], ['श्रोत्रं', 'श्रोत्रम्'], ['उपस्थं', 'उपस्थम्'], ['कान्ति*', 'कान्तिः*'], ['*ॐ ', '*ओं '], ['; ॐ ', '; ओं ']];
const norm = (s) => {
  for (const [a, b] of SPELL) s = s.split(a).join(b);
  return s.replace(/<br\/>/g, ' ').replace(/[\s*–]+/g, ' ').replace(/(\d\d):(\d\d)/g, '$1:$2').trim();
};
// Times compared to the minute, allowing one minute either way.
const minutes = (s) => [...s.matchAll(/([०-९]{2}):([०-९]{2})/g)].map((m) => {
  const n = (x) => Number([...x].map((c) => DIG.indexOf(c)).join(''));
  return n(m[1]) * 60 + n(m[2]);
});

let ok = 0, bad = 0, timeOnly = 0;
for (const [date, text] of Object.entries(ics)) {
  const day = days.get(date);
  if (!day) continue;
  const a = ashtanga(day);
  a.visesha = a.visesha.filter((v) => v !== 'nityAmElanam');
  const mine = norm(`${A.phrases.title} ${ashtangaSankalpa(A, a, T).join(' ')} ${A.phrases.vidyA} ${vidya(A, a)}`);
  // The ICS's tithinityA, A (t); B, in this app's bracketed form, A (t; B ➥).
  const nested = (s) => s.replace(/\*([^*]*)\* तिथिनित्यायां/, (_, x) => {
    const items = x.split('; ').map((it) => it.match(/^(.*?)(?: \(([^)]*)\))?$/));
    const build = (i) => (items[i][2] && i + 1 < items.length ? `${items[i][1]} (${items[i][2]}; ${build(i + 1)})` : `${items[i][1]}${i ? ' ➥' : ''}`);
    return `*${build(0)}* तिथिनित्यायां`;
  });
  const theirs = norm(nested(text).replace(/\*?दिननित्याविद्या\*?–(\S+)/, (_, v) => `दिननित्याविद्या ${v}`));
  // The ICS's vidyA is transliterated with a halanta between its parts (क्ष् आ … joined): compare letters only.
  const strip = (s) => s.replace(/दिननित्याविद्या (\S+)$/, (_, v) => `दिननित्याविद्या ${v.replace(/[्ािीुूृॄॢॣेैोौ]/g, '').replace(/[आई]/g, '')}`);
  if (strip(mine) === strip(theirs)) { ok++; continue; }
  const noTimes = (s) => strip(s).replace(/[०-९]{2}:[०-९]{2}\*?/g, '');
  const tm = minutes(mine), tt = minutes(theirs);
  if (noTimes(mine) === noTimes(theirs) && tm.length === tt.length && tm.every((m, i) => Math.abs(m - tt[i]) <= 1)) { timeOnly++; ok++; continue; }
  bad++;
  if (bad <= 5) console.log(`${date}\n  ics : ${theirs}\n  app : ${mine}`);
}
console.log(`${ok} days agree (${timeOnly} with a tithi end a minute apart), ${bad} differ`);
process.exit(bad ? 1 : 0);
