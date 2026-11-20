// The Shakta Ashtanga of a day: a port of kamakoti-panchangam/ashtanga/bin's get_ashtanga_data_jd,
// get_ashtanga_details and get_ashtanga_sankalpa (the monthly Ashtangam PDF and the daily ICS / Telegram
// sankalpa), checked against the published ICS by tools/check_ashtanga.mjs.
//
// All of it but the tithinityA is arithmetic on the kalyahargaNa, the count of days since the Kali
// epoch (JD 588465.5) at the day's sunrise, as the "Ashtangam Calculation" sheet sets out: the
// udayaghaTikA is k mod 5, the vAsara k mod 9, the dinanityA k mod 30, the kAlanityA k mod 16, the
// tattvadivasa (and the nakSatra, yOga and karaNa letters) k mod 36; then q = k div 36 gives the
// nityAmAsa and kalAmAsa (q mod 16) and the Rtu (half of that); q div 16 the tattvavatsara (mod 36),
// and so on up. The tithinityA is the tithi itself, from the panchaanga.
//
// Indices here are 0-based into the name tables of data/s/<script>.json → ashtanga.

// JD 588465.5 is the Kali epoch; 2440587.5 the JD of 1970-01-01 0h UT.
const KALI_EPOCH_JD = 588465.5;
const UNIX_EPOCH_JD = 2440587.5;

// The generators' int(jd_sunrise - 588465.5): for a sunrise after 0h UT on the same date (all of
// India; anywhere east of about 90°W with a morning sunrise), the date's 0h UT JD less the epoch.
export function kalyahargana(date) {
  const [y, m, d] = date.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000 + UNIX_EPOCH_JD - KALI_EPOCH_JD);
}

// The first letters the viSesha-yOga test compares, as the generators take them (the name's first
// word). citrA and mahAnityA are a bare M and H in their tables, so they match only each other.
const STEM = {
  tattva: ['aM', 'kaM', 'khaM', 'gaM', 'ghaM', 'GaM', 'caM', 'chaM', 'jaM', 'jhaM', 'JaM', 'TaM', 'ThaM', 'DaM', 'DhaM', 'NaM',
    'taM', 'thaM', 'daM', 'dhaM', 'naM', 'paM', 'phaM', 'baM', 'bhaM', 'maM', 'yaM', 'raM', 'laM', 'vaM', 'zaM', 'SaM', 'saM',
    'haM', 'LaM', 'kSaM'],
  nityamasa: ['aM', 'AM', 'iM', 'IM', 'uM', 'UM', 'RM', 'RRM', 'lRM', 'lRRM', 'EM', 'aiM', 'OM', 'auM', 'M', 'H'],
  nitya30: ['aM', 'AM', 'iM', 'IM', 'uM', 'UM', 'RM', 'RRM', 'lRM', 'lRRM', 'EM', 'aiM', 'OM', 'auM', 'M',
    'M', 'auM', 'OM', 'aiM', 'EM', 'lRRM', 'lRM', 'RRM', 'RM', 'UM', 'uM', 'IM', 'iM', 'AM', 'aM'],
  vasara: ['aM', 'lRM', 'kaM', 'caM', 'TaM', 'taM', 'paM', 'yaM', 'SaM'],
  // The udayaghaTikA's is its last word with an anusvAra: kAlyAkhya a → aM.
  ghatika: ['aM', 'EM', 'caM', 'taM', 'yaM'],
};

// The viSesha-puNyakAlas (the PDF's table): a day is one when all the listed angas begin with
// the same letter. The monthly generator's rules (nityAmElanam compares the tithinityA at sunrise).
export const VISESHA = [
  ['puSpiNI', ['vatsara', 'nityamasa']],
  ['mOhinI', ['vatsara', 'divasa']],
  ['jayinI', ['vatsara', 'ghatika']],
  ['kumArI', ['nityamasa', 'divasa']],
  ['vimalA', ['nityamasa', 'ghatika']],
  ['zrIkarI', ['divasa', 'ghatika']],
  ['sUryagrahaNam', ['vatsara', 'nityamasa', 'divasa']],
  ['nityAmElanam', ['tithinitya', 'dinanitya']],
  ['vArOdayaH', ['vasara', 'ghatika']],
  ['candragrahaNam', ['dinanitya', 'nityamasa', 'ghatika', 'vasara']],
  ['zrIrAtriH', ['ghatika', 'vasara', 'dinanitya']],
];

// How far after sunrise the tithinityA lists the tithis that begin (the generators' 40 ghaTikAs).
const WINDOW = 960;

function sunrise(day) {
  return day.sun_s ? day.sun_s[0] / 60 : day.sun[0];
}

// The tithis of the tithinityA: the one running at sunrise and any that begin within 40 ghaTikAs,
// each with its end if that is within the window too. {id: 1…30, end: minutes or null}.
export function tithiNityas(day) {
  const rise = sunrise(day);
  const limit = rise + WINDOW;
  const out = [];
  for (const [id, end] of day.tithi) {
    if (end != null && end <= rise) continue; // ended before this sunrise
    out.push({ id, end: end != null && end <= limit ? end : null });
    if (end == null || end > limit) break;
  }
  return out;
}

// The tithi running at minute t of the day (minutes after its midnight, past 1440 until the next sunrise).
export function tithiAt(day, t) {
  const hit = day.tithi.find(([, end]) => end == null || end > t);
  return (hit || day.tithi[day.tithi.length - 1])[0];
}

export function ashtanga(day) {
  const k = kalyahargana(day.date);
  const q = Math.floor(k / 36);
  const q2 = Math.floor(q / 16);
  const nityamasa = q % 16;
  const a = {
    k,
    mahakalpa: 20, kalpa: 18, mahayuga: 17,
    yuga: Math.floor(q2 / 1296) % 36,
    parivritti: Math.floor(q2 / 36) % 36,
    vatsara: q2 % 36,
    rtu: Math.floor(nityamasa / 2),
    nityamasa,
    kalamasa: nityamasa,
    tithis: tithiNityas(day),
    dinanitya: k % 30,
    kalanitya: k % 16,
    divasa: k % 36,
    vasara: k % 9,
    letter: k % 36, // the nakSatra, yOga and karaNa letters
    ghatika: k % 5,
    // The day-of-the-tattvadivasa-cycle and of the nityAmAsa, 1-based, as the PDF numbers its rows.
    divasaNo: (k % 36) + 1,
  };
  const stems = {
    vatsara: STEM.tattva[a.vatsara],
    nityamasa: STEM.nityamasa[a.nityamasa],
    divasa: STEM.tattva[a.divasa],
    ghatika: STEM.ghatika[a.ghatika],
    vasara: STEM.vasara[a.vasara],
    dinanitya: STEM.nitya30[a.dinanitya],
    tithinitya: STEM.nitya30[a.tithis[0].id - 1],
  };
  a.visesha = VISESHA.filter(([, angas]) => angas.every((x) => stems[x] === stems[angas[0]])).map(([name]) => name);
  return a;
}

// The tithinityA names: of the tithis from sunrise (with their ends, as `T` writes a time), or of the one
// running at minute `t`.
export function tithiNityaText(A, a, T, t = null) {
  if (t != null) return null;
  return a.tithis.map(({ id, end }) => A.nitya30[id - 1] + (end != null ? ` (${T(end)})` : '')).join('; ');
}

export function vidya(A, a) {
  return A.vidya1[a.vatsara][a.nityamasa] + A.vidya2[a.divasa] + A.vidya3;
}

// The sankalpa, as phrases with *bold* marks (the ICS's), one array entry to a line. With `t` (minutes
// after the day's midnight), the tithinityA is the tithi running then, and has no time.
export function ashtangaSankalpa(A, a, T, t = null, day = null) {
  const P = A.phrases;
  const b = (x) => `*${x}*`;
  const tn = t != null && day ? A.nitya30[tithiAt(day, t) - 1] : tithiNityaText(A, a, T);
  const vis = a.visesha.length ? ` (${a.visesha.map((v) => A.visesha[v][1]).join('/')} ${P.vizESa})` : '';
  return [
    P.head,
    `${b(A.tattva[a.mahakalpa])} ${P.mahAkalpa} ${b(A.tattva[a.kalpa])} ${P.kalpa}`,
    `${b(A.tattva[a.mahayuga])} ${P.mahAyuga} ${b(A.tattva[a.yuga])} ${P.yuga}`,
    `${b(A.tattva[a.parivritti])} ${P.parivRtti} ${b(A.tattva[a.vatsara])}${P.vatsara}`,
    `${b(A.rtu[a.rtu])} ${P.Rtu} ${b(A.nityamasa[a.nityamasa])} ${P.nityAmAsa} ${b(A.kalamasa[a.kalamasa])} ${P.kalAmAsa}`,
    `${b(tn)} ${P.tithinityA} ${b(A.nitya30[a.dinanitya])} ${P.dinanityA} ${b(A.kalanitya[a.kalanitya])} ${P.kAlanityA}`,
    `${b(A.tattva[a.divasa])} ${P.divasa} ${b(A.vasara[a.vasara])} ${P.vAsara}`,
    `${b(A.nakshatra[a.letter])} ${P.nakSatra} ${b(A.yoga[a.letter])} ${P.yOga} ${b(A.karana[a.letter])} ${P.karaNa}`,
    `${b(A.ghatika[a.ghatika] + P.kAra)} ${P.ghaTikOdaya}${vis}`,
    P.tail,
  ];
}
