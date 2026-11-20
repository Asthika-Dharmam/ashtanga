// What is the Ashtangam: Sri Kanchi Mahaswami's direction of April 1973, as Brahmashri K. Dinakara
// Sarma set it down (MahaPeriyavas-direction-eng.pdf and -tamil.pdf), in English or Tamil, then how
// this app reckons the eight angas. Words cut off at the English PDF's right margin are completed
// in [brackets]; the Tamil is transcribed from its PDF.
import { h, saveSettings } from './util.js';

const EN = {
  title: 'Ashtangam',
  sub: 'Sri Kanchi Mahaswami’s Vagamrutam in April 1973',
  body: [
    'Sri Swamigal gave me an order in the year Pramaadeesa, as follows:',
    '“We calculate *Panchangam* – consisting of five angas (parts) viz., *Tithi, Vaaram, Nakshatram, Yogam and Karanam* – based on the movement of moon [and] sun and use them in our daily rituals. Sridevi Upasaka Bhaskararaya, who used to dialogue with DEVI in person, has given in his commentary on *Parasurama Kalpasutra*, the methodology to calculate *Devimana Ashtanga Ganana* and the method to use it also.',
    'The 8 angaas are: Tatvamahakalpa, Tatvakalpa, Tatvamahayuga, Tatvayuga, Tatvaparivrutti. 1. Tatva Varsha, 2. Rutu, 3. Nithya Month, 4. Tithi Nithya, 5. Dina Nithya, 6. Tatva Divasam, 7. Vaasaram and 8. Udaya Gatika.',
    'Devimana Ashtangam is read daily in the Kanchi Mutt, during the pooja samkalpa.” Long back, a learned person from Andhra used to come to the Mutt, every Chaandramana year beginning and used to write these calculations in a notebook for the 1 whole year. On Telugu New Year – Ugadi – he used to re[ad the] Panchangam and Ashtangam. Sri Swamigal asked me to learn this calculation from him and prepare the ashtanga for the upcoming years. Since then, each yea[r I] used to prepare a handwritten one and give it to the mutt. Now using computer for this purpose has simplified the preparation.',
    'A unique occurrence – this happens only once in 144 yrs – is observed in this SARVADHARI year, on 12th of AAVANI month, (27-8-2008). This day [is] considered as *MAHAPUNYA KALA* – a very auspicious day – since the letter *AM (अम्)* joins with each one of the eight angaas. This happening of 10 yog[as] is considered as an auspicious time in mantra sastra. How the yogas happen and their names are given in page 4 of the Ashtangam. Let all of us Sakthas pay o[ur] obeisance to Devi Maha Thiripurasundary by offering pooja, japam and homam and obtain her blessings. Asseervatham –',
  ],
  sign: 'Sri K. Dinakara Sarma, Kumbakonam',
};

const TA = {
  title: 'ஓம் ஸ்ரீயை நமஹ · அஷ்டாங்கம்',
  sub: 'ஓம் ஸ்ரீ காஞ்சி மஹாபெரியவரின் வாக்கமிர்தம் · ஏப்ரல் 1973',
  body: [
    'ஸ்ரீ ப்ரமாதீச வருஷம் ஸ்ரீ பெரியவாள் எனக்கிட்ட ஆக்ஞை:',
    '‘எப்படி உலகில் சந்திர சூர்யர்களை வைத்து கணனம் செய்து திதி, வார, நக்ஷத்திர, யோக, கரணம் என்ற ஐந்து அங்கங்களோடு கூடிய பஞ்சாங்கம் உபயோகப்படுத்துகிறோமோ, அதேபோல் தேவி (ஸ்ரீவித்யா) வழிபாடு செய்வதில் மிகஉயர்ந்த, அம்பிகையுடன் நேரே ஸல்லாபித்த மஹான் – ஸ்ரீ பாஸுரானந்தநாதர் என்று பிரஸித்தபெற்ற ஸ்ரீ பாஸ்கரராயர் – அவர் ஸ்ரீ பரசுராமகல்ப ஸூத்ரத்தின் விளக்க உரையில் இந்த தேவீமான அஷ்டாங்க கணனம் சொல்லி, அதை உபயோகிக்கும் முறையையும் கூறியுள்ளார். எட்டு அங்கங்களாவன – தத்வ மஹாகல்பம், தத்வ கல்பம், தத்வ மஹாயுகம், தத்வ யுகம், தத்வ பரிவிருத்தி (1) தத்வ வருடம் (2) ருது (3) நித்யாமாதம் (4) திதிநித்யா (5) தினநித்யா (6) தத்வதிவஸம் (7) வாஸரம் (8) உதயகடிகா என்பன. இதை நம் மடத்தில் தினம் பூஜை சங்கல்பத்தில் சொல்லி வருகிறோம்.’',
    'முன்பு ஆந்திராவிலிருந்து ஒரு பெரியவர் பிரதி சாந்திரமான வருட ஆரம்பமுதல் ஒரு வருடத்திற்குக் கணக்கிட்டு நோட்டுப்புஸ்தகத்தில் எழுதிக்கொடுத்து தெலுங்கு வருடப்பிறப்பன்று பஞ்சாங்க படனம் அஷ்டாங்க படனமும் செய்துவிட்டுப் போவார். ஸ்ரீ பெரியவா என்னை அவரிடம் கேட்டறிந்து நீ தொடர்ந்து செய் என உத்தரவிட்டார். அது முதல் கையால் எழுதிக்கொண்டு வந்து இப்பொழுது கம்ப்யூட்டர் மூலமாக பல விஷயங்கள் சேர்த்துப்போட சௌகரியமாக உள்ளது.',
    'இந்த ஸர்வதாரி ஆவணி 12ம் தேதி (இது 144 வருடத்திற்கு ஒரு முறை மாத்திரம் வரும்) 27.08.2008 – அஷ்டாங்க எட்டு அங்கங்களின் முதல் அக்ஷரம் (அம்) பரஸ்பரம் சேர்வதால் 10 யோகங்கள் ஏற்படுவதை, மந்திர சாஸ்த்ரம் மஹாபுண்யகாலமாக கூறியுள்ளது. இந்த யோகங்கள் ஏற்படும் முறை, அவைகளின் பெயர்களுடன் அஷ்டாங்க 4வது பக்கத்தில் கொடுக்கப்பட்டு உள்ளது. அன்று அனைவரும் – சாக்தர்களும் – ஸ்ரீ மஹாத்ரிபுரஸுந்தரியை ஜப பூஜா ஹோமங்களால் வழிபட்டுப் பேரானந்தம் அடைவோமாக.',
  ],
  sign: 'ஸ்ரீ தினகர சர்மா, கும்பகோணம்',
};

const bold = (text) => text.split(/(\*[^*]+\*)/).filter(Boolean)
  .map((p) => (/^\*.*\*$/.test(p) ? h('strong', null, p.slice(1, -1)) : p));

export async function renderAshtangam(ctx, root) {
  const { settings } = ctx;
  let lang = settings.ashtangamLang === 'ta' ? 'ta' : 'en';
  const note = h('article', { class: 'card letter' });
  const segs = h('div', { class: 'segs no-swipe', role: 'group', 'aria-label': 'Language' });

  function draw() {
    const L = lang === 'ta' ? TA : EN;
    segs.replaceChildren(...[['en', 'English'], ['ta', 'தமிழ்']].map(([id, label]) => h('button', {
      class: 'seg' + (lang === id ? ' on' : ''), 'aria-pressed': String(lang === id),
      onclick: () => { lang = id; settings.ashtangamLang = id; saveSettings(settings); draw(); },
    }, label)));
    note.setAttribute('lang', lang);
    note.replaceChildren(
      h('p', { class: 'om', lang: 'sa' }, 'ॐ जय जय शङ्कर हर हर शङ्कर ॥'),
      h('h2', null, L.title),
      h('p', { class: 'letter-sub' }, L.sub),
      ...L.body.map((p) => h('p', null, bold(p))),
      h('p', { class: 'sign' }, L.sign),
      h('p', { class: 'om', lang: 'sa' }, '॥ इदं अष्टाङ्गम् श्रीमत् आचार्य चरणारविन्देषु समर्पणम् ॥'));
  }
  draw();

  const how = h('section', { class: 'card' },
    h('h2', null, 'The eight angas in this app'),
    h('p', null, 'The Ashtanga tab shows the day’s eight angas: the tattvavatsara, ṛtu, nityāmāsa (with its kalāmāsa), tithinityā, dinanityā, tattvadivasa, vāsara and udayaghaṭikā. It also shows the larger cycles above them (tattva-mahākalpa, kalpa, mahāyuga, yuga and parivṛtti) and the viśeṣa puṇyakālas that arise when their first letters meet. All but the tithinityā are counted from the days elapsed since the start of the Kali yuga; the tithinityā is the tithi itself.'),
    h('p', null, h('button', { class: 'link', onclick: () => ctx.go({ tab: 'ashtanga', date: null }) }, 'Today’s Ashtanga'),));

  root.append(segs, note, how);
}
