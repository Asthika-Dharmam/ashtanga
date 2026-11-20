// The festivals of a day, in two lists as the Ashtangam prints them: the Ashtanga ones (devI-parvas,
// pancha-parvas including the sankramaNa, the dasha-mahAvidyA jayantIs, the navarAtras, and the
// viSesha-puNyakAlas of the Ashtanga itself) and the panchanga ones.
import { ashtanga as computeAshtanga } from './ashtanga.js';

// The pUjA kAla of each dasha-mahAvidyA jayantI, from the Ashtangam's table
// (daSamahAvidyAH pUjAkAlAzca): madhyarAtri but for mAtaGgI (aparAhNa) and lalitA (pradOSa).
const VIDYA_KALA = {
  'mahAtArA~jayantI': 'madhyaraatri', 'rAja-mAtaGgI~jayantI': 'aparaahna', 'bagalAmukhI~jayantI': 'madhyaraatri',
  'chinnamastA~jayantI': 'madhyaraatri', 'dhUmAvatI~jayantI': 'madhyaraatri', 'bhuvanEzvarI~jayantI': 'madhyaraatri',
  'mahAkAlI~jayantI': 'madhyaraatri', 'tripura~bhairavI~jayantI': 'madhyaraatri', 'kamalA~jayantI': 'madhyaraatri',
  'lalitA~jayantI': 'pradosha',
};

// The kAlas, as jyotisha's FifteenFoldDivision has them: aparAhNa the fourth fifth of the day,
// pradOSa the first eighth of the night, madhyarAtri its middle fifth. [start, end] in minutes.
export function kala(day, id) {
  const [rise, set] = day.sun_s ? day.sun_s.slice(0, 2).map((s) => s / 60) : day.sun;
  const night = day.next_sunrise - set;
  if (id === 'aparaahna') return [rise + (set - rise) * 3 / 5, rise + (set - rise) * 4 / 5];
  if (id === 'pradosha') return [set, set + night / 8];
  if (id === 'madhyaraatri') return [set + night * 2 / 5, set + night * 3 / 5];
  return null;
}

// The pUjA times of a festival: [{label, span}] or null. The devI-parvas are night pUjAs
// (rAtripUjA kAryA, as the Ashtangam heads its list): the pradOSa and the madhyarAtri.
function pujaTimes(ctx, day, key) {
  const K = ctx.S.kaala || {};
  const one = (id) => ({ label: K[id] || id, span: kala(day, id) });
  if (/^devi-parva/.test(key)) return { title: ctx.A.phrases.ratripuja, times: [one('pradosha'), one('madhyaraatri')] };
  if (VIDYA_KALA[key]) return { title: null, times: [one(VIDYA_KALA[key])] };
  return null;
}

// kind: parva | mahavidya | navaratri | visesha
function kindOf(key) {
  if (/^(devi|pancha)-parva/.test(key)) return 'parva';
  if (/navarAtra/.test(key)) return 'navaratri';
  return 'mahavidya';
}

export function festivalsOf(ctx, day, a = computeAshtanga(day)) {
  const { F, A } = ctx;
  const ashtanga = [];
  if (day.saura.d === 1) ashtanga.push({ key: 'sankramana', kind: 'parva', name: A.phrases.sankramana });
  for (const key of day.fa || []) ashtanga.push({ key, kind: kindOf(key), name: F[key] || key, puja: pujaTimes(ctx, day, key) });
  for (const v of a.visesha) ashtanga.push({ key: v, kind: 'visesha', name: A.visesha[v][0] });
  const groups = ctx.index.groups || {};
  const panchanga = (day.fp || []).map((key) => ({ key, kind: 'p', name: F[key] || key, groups: groups[key] || [] }));
  return { ashtanga, panchanga };
}

// A Navāvaraṇa pūjā day, as the PDF marks it: a parva, a mahāvidyā jayantī, or within a navarātra.
export function isNavavarana(list, inNavaratri) {
  return inNavaratri || list.some((f) => f.kind === 'parva' || f.kind === 'mahavidya' || f.kind === 'navaratri');
}

// Whether a date falls in a navarātra: its ārambha on or before the date with no samāpana before it.
// `days` are the Kali year's days in order.
export function inNavaratri(days, date) {
  let open = false;
  for (const d of days) {
    if (d.date > date) break;
    for (const key of d.fa || []) {
      if (/navarAtra-ArambhaH$/.test(key)) open = true;
      else if (/navarAtra-samApanam$/.test(key) && d.date < date) open = false;
    }
  }
  return open;
}

// A festival's name, with its pUjA times after it if it has them.
export function festLabel(h, ctx, f) {
  if (!f.puja) return f.name;
  const T = (m) => ctx.T(m);
  return [f.name, h('small', { class: 'puja' },
    f.puja.title ? `${f.puja.title}: ` : '',
    f.puja.times.map(({ label, span: [a, b] }) => `${label} ${T(a)}–${T(b)}`).join(' · '))];
}
