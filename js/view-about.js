// About: Asthika Dharmam, ordering the panchangam, the WhatsApp and Telegram channels, the
// Ashtangam, settings, and where the data comes from. The logo is the site's banner. The links are as asthikadharmam.org gives them
// (asthikadharmam-panchangam/, about/, contact/).
import { h, svg } from './util.js';
import { ICONS } from './icons.js';

const SITE = 'https://asthikadharmam.org/';
const ORDER_PAGE = 'https://asthikadharmam.org/asthikadharmam-panchangam/';
const ORDER_FORM = 'https://forms.gle/X37VdweCQ3CeAZwN7';
const RETAIL_WA = 'https://wa.me/919940100056';
const TELEGRAM = 'https://t.me/ashtangam';
const YOUTUBE = 'https://www.youtube.com/@AsthikaDharmamChannel';
const ZONES = [
  ['Chennai', 'https://chat.whatsapp.com/L38s98PZq1zISVDNntr2eH'],
  ['Delhi', 'https://chat.whatsapp.com/EE1zRX75lDP2NBBuWChDR7'],
  ['Mumbai', 'https://chat.whatsapp.com/IoRqbUykZrW0eXbxQMaQtD'],
  ['Bengaluru', 'https://chat.whatsapp.com/JefRWyzhKWX0dFGcs3rcIA'],
  ['Kolkata', 'https://chat.whatsapp.com/L1zD8e3tyfyEnoYUkFxPPA'],
  ['Kovai', 'https://chat.whatsapp.com/FIvh4ukHPWOJohCrVvgI78'],
  ['Madurai', 'https://chat.whatsapp.com/IO8uNw84mnvJCk2VnjrJbU'],
  ['Tanjavur', 'https://chat.whatsapp.com/DVbmSxFNefHGAPXoRi5Y09'],
];
const SCRIPT_NAMES = { devanagari: 'देवनागरी', tamil: 'தமிழ்', grantha: '𑌗𑍍𑌰𑌨𑍍𑌥', telugu: 'తెలుగు', kannada: 'ಕನ್ನಡ', iso: 'Roman (ISO)' };

const ext = (href, ...children) => h('a', { href, target: '_blank', rel: 'noopener' }, ...children);
const action = (href, icon, title, sub) => h('a', { class: 'action', href, target: '_blank', rel: 'noopener' },
  svg(ICONS[icon]), h('span', null, h('b', null, title), sub ? h('small', null, sub) : null), svg(ICONS.link, 'ico go'));

export async function renderAbout(ctx, root) {
  const { settings, index, save } = ctx;
  const b = index.build || {};

  const intro = h('section', { class: 'card about-hero' },
    h('img', { class: 'logo', src: 'icons/asthikadharmam.png', alt: 'Asthika Dharma: आस्तिक-धर्मः, ஆஸ்திக தர்மம்', width: 768, height: 296 }),
    h('p', { class: 'motto', lang: 'sa' }, 'धर्मो रक्षति रक्षितः'),
    h('p', null, 'Asthika Dharmam is concerned with the promotion of spiritual activities and the publication of religious books (under “Asthika Dharmam Publications”) such as those related to the performance of Hindu rituals, e.g. Sandhyavandanam.'),
    h('p', null, 'This app is its companion for the few who keep the Śākta Aṣṭāṅga: the day’s pañcāṅga and aṣṭāṅga, both sankalpas, and the year’s festivals, on the phone and offline.'),
    ext(SITE, 'asthikadharmam.org'));

  const order = h('section', { class: 'card' },
    h('h2', null, 'The AsthikaDharmam Panchangam'),
    h('p', null, 'Printed for multiple cities in India, each for its own latitude.'),
    h('div', { class: 'actions' },
      action(ORDER_FORM, 'book', 'Order the panchangam', 'Google form · Plavanga samvatsara, 2027–28'),
      action(RETAIL_WA, 'whatsapp', 'Retail and bulk purchase', 'WhatsApp +91 99401 00056'),
      action(ORDER_PAGE, 'link', 'Panchangam page', 'asthikadharmam.org')));

  const channels = h('section', { class: 'card' },
    h('h2', null, 'Every day, on your phone'),
    h('div', { class: 'actions' },
      action(TELEGRAM, 'telegram', 'Ashtanga sankalpa on Telegram', 't.me/ashtangam'),
      action(YOUTUBE, 'youtube', 'Asthika Dharmam on YouTube', '@AsthikaDharmamChannel')),
    h('p', { class: 'sub' }, 'Daily Vākya Pañcāṅgam on WhatsApp, by zone:'),
    h('div', { class: 'zones' }, ZONES.map(([z, href]) => ext(href, svg(ICONS.whatsapp), z))));

  const ashtangam = h('section', { class: 'card' },
    h('h2', null, 'The Śrī Devīmāna Aṣṭāṅgam'),
    h('p', null, 'The Ashtanga here follows the Śrī Devīmāna Aṣṭāṅgam prepared each year by Brahmaśrī Dinakara Śarmā at the direction of Śrī Kāñcī Mahāsvāmī, and the daily Śākta Aṣṭāṅga sankalpa sent on Telegram.'),
    h('div', { class: 'actions' },
      h('a', { class: 'action', href: '#ashtangam' }, svg(ICONS.ashtanga), h('span', null, h('b', null, 'What is the Ashtangam?'), h('small', null, 'Mahāperiyavā’s direction, 1973 · English, தமிழ்')), svg(ICONS.right, 'ico go'))),
    h('p', null, ext('https://bit.ly/ashtanga-errata', 'Errata for the printed Ashtangam'), ' · ', ext('https://asthikadharmam.org/corrections/', 'Panchangam corrections')));

  const thanks = h('section', { class: 'card thanks' },
    h('h2', null, 'Acknowledgements'),
    h('p', null, 'We express our profound gratitude to our Guru Brahmashri Dinakara Sharma, who is one of the foremost Shrividyopasakas.'));

  const contact = h('section', { class: 'card' },
    h('h2', null, 'Contact'),
    h('p', null, h('b', null, 'Brahmashri Ky. Bharaneedhara Sastrigal'), h('br'), 'West Mambalam, Chennai 600 033'),
    h('div', { class: 'actions' },
      action('tel:+919940100056', 'phone', 'Call', '99401 00056'),
      action('https://wa.me/919884975273', 'whatsapp', 'WhatsApp only', '98849 75273'),
      action('https://asthikadharmam.org/contact/', 'link', 'Contact page', 'asthikadharmam.org')));

  const select = (label, key, options) => h('label', { class: 'set' }, h('span', null, label),
    h('select', { onchange: (e) => save({ [key]: e.target.value }) },
      options.map(([v, l]) => h('option', { value: v, selected: String(settings[key]) === String(v) }, l))));
  const prefs = h('section', { class: 'card settings', id: 'settings' },
    h('h2', null, 'Settings'),
    select('City', 'city', index.cities.map((c) => [c.id, c.label])),
    select('Script', 'script', index.scripts.map((s) => [s, SCRIPT_NAMES[s] || s])),
    select('Theme', 'theme', [['auto', 'As the device'], ['light', 'Light'], ['dark', 'Dark']]),
    h('label', { class: 'set' }, h('span', null, 'Clock'),
      h('select', { onchange: (e) => save({ twelve: e.target.value === '12' }) },
        h('option', { value: '24', selected: !settings.twelve }, '24-hour (as printed)'),
        h('option', { value: '12', selected: !!settings.twelve }, '12-hour'))),
    select('Text size', 'size', [[0.9, 'Smaller'], [1, 'Normal'], [1.1, 'Larger'], [1.25, 'Largest']]));

  const dataNote = h('section', { class: 'card data' },
    h('h2', null, 'The data'),
    h('p', null, 'The pañcāṅga is the Adyatithi pañcāṅga’s, computed with ', ext('https://github.com/jyotisham/jyotisha', 'jyotisha'),
      ' and the festival rules of ', ext('https://github.com/jyotisham/adyatithi', 'adyatithi'),
      ', copied into this app; the Ashtanga is reckoned from it on the phone. It works offline once opened.'),
    h('p', { class: 'muted' }, `Data built ${b.date || '—'} · jyotisha ${b.jyotisha || '—'} · adyatithi ${b.adyatithi || '—'}`),
    h('p', null, 'The full pañcāṅga, with every kāla, muhūrta and observance: ', ext('https://adyatithi.github.io/panchaanga/', 'Adyatithi Panchaanga'), '.'));

  root.append(intro, ashtangam, order, channels, prefs, contact, thanks, dataNote);
}
