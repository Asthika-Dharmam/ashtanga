// The panchanga sankalpa, as kamakoti-panchangam's daily sankalpa ICS writes it
// (drik/bin/write_daily_panchanga_sankalpa_ics.py): each anga from sunrise, and, if it ends by
// 22:00, its end and the anga that follows, bracketed in turn, the last one marked ➥:
//
//   पूर्वप्रोष्ठपदा-नक्षत्र (०६:५४; उत्तरप्रोष्ठपदा-नक्षत्र ➥) युक्तायां
//   गरजा-करण (०७:१६; वणिजा-करण (१९:००; भद्रा-करण ➥)) युक्तायाम्
//
// The same for the tithi, the paksha and the solar month. The words come from the panchaanga's
// data (static <script>.json → sankalpa); m or M before the next part as the sankalpa list has it.

// The ICS lists a change only up to 22:00 (22/24 of the day from its midnight).
const LIMIT = 22 * 60;

const sunrise = (day) => (day.sun_s ? day.sun_s[0] / 60 : day.sun[0]);

// An anga's spans from sunrise, each named and, while it ends by 22:00, followed by the next.
function chain(day, key, name, T) {
  const rise = sunrise(day);
  const spans = day[key].filter(([, end]) => end == null || end > rise);
  const build = (i) => {
    const [id, end] = spans[i];
    if (end != null && end <= LIMIT && i + 1 < spans.length) return `${name(id)} (${T(end)}; ${build(i + 1)})`;
    return i ? `${name(id)} ➥` : name(id);
  };
  return { text: build(0), first: spans[0][0], spans };
}

export function panchangaSankalpa(day, samvatsara, K, T) {
  const vowel = (key, id) => K.vowel[key].includes(id);
  // A part and the word joined after it: straight on (…नक्षत्रयुक्तायां), or after a space when the
  // part closes a bracket or a ➥.
  const join = (s, word) => (/[)➥]$/.test(s) ? `${s} ${word.replace(/^\\-/, '')}` : s + word);

  const tithi = chain(day, 'tithi', (id) => K.tithi[id], T);
  const nak = chain(day, 'nakshatra', (id) => K.nakshatra[id], T);
  const yoga = chain(day, 'yoga', (id) => K.yoga[id], T);
  const kar = chain(day, 'karana', (id) => K.karana[id], T);

  // The paksha, and its change if a pUrNimA or amAvAsyA ends by 22:00.
  const p0 = tithi.first <= 15 ? 0 : 1;
  const turn = tithi.spans.find(([id, end]) => id % 15 === 0 && end != null && end <= LIMIT);
  const paksha = turn ? `${K.paksha[p0]} (${T(turn[1])}; ${K.paksha[1 - p0]} ➥)` : K.paksha[p0];

  // The months: the solar month (and its change, if the sankramaNa falls between sunrise and
  // 22:00), then the lunar month.
  const sm = day.saura.m;
  const chandra = K.chandra[String(day.chandra)] || '';
  let month = `${K.saura[sm]}${chandra}`;
  if (day.saura.end) {
    const [prevM, at] = day.saura.end;
    const shown = at >= day.next_sunrise ? at - 1440 : at;
    if (shown > sunrise(day) && shown <= LIMIT) month = `${K.saura[prevM]} (${T(shown)}; ${K.saura[(prevM % 12) + 1]} ➥)${chandra}`;
  }

  return [
    K.samvatsara[samvatsara], K.ayana[sm], K.rtu[sm], month, paksha,
    `${tithi.text} ${K.zubha}`,
    K.vara[day.wd][vowel('nakshatra', nak.first) ? 0 : 1],
    join(nak.text, K.yukta[vowel('yoga', yoga.first) ? 0 : 1]),
    join(yoga.text, K.yukta[vowel('karana', kar.first) ? 0 : 1]),
    join(kar.text, K.yukta[0]),
    `${K.evam} `,
    `${K.asyam[vowel('tithi', tithi.first) ? 0 : 1]} ${tithi.text}`,
  ];
}
