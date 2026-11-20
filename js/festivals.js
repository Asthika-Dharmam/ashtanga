// The festivals of a day, in two lists as the Ashtangam prints them: the Ashtanga ones (devI-parvas,
// pancha-parvas including the sankramaNa, the dasha-mahAvidyA jayantIs, the navarAtras, and the
// viSesha-puNyakAlas of the Ashtanga itself) and the panchanga ones.
import { ashtanga as computeAshtanga } from './ashtanga.js';

// kind: parva | vidya | navaratri | visesha
function kindOf(key) {
  if (/^(devi|pancha)-parva/.test(key)) return 'parva';
  if (/navarAtra/.test(key)) return 'navaratri';
  return 'mahavidya';
}

export function festivalsOf(ctx, day, a = computeAshtanga(day)) {
  const { F, A } = ctx;
  const ashtanga = [];
  if (day.saura.d === 1) ashtanga.push({ key: 'sankramana', kind: 'parva', name: A.phrases.sankramana });
  for (const key of day.fa || []) ashtanga.push({ key, kind: kindOf(key), name: F[key] || key });
  for (const v of a.visesha) ashtanga.push({ key: v, kind: 'visesha', name: A.visesha[v][0] });
  const panchanga = (day.fp || []).map((key) => ({ key, kind: 'p', name: F[key] || key }));
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
