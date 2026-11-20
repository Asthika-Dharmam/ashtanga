# Ashtanga

A small web app, installable on a phone and usable offline, for those who keep the Śākta Aṣṭāṅga: the day's
pañcāṅga and aṣṭāṅga, the Ashtanga and panchanga sankalpas, and the year's festivals. It is a
companion to the AsthikaDharmam Panchangam and to the
[Adyatithi Panchaanga](https://adyatithi.github.io/panchaanga/), whose data it carries.

Cities: Chennai, Kanchipuram, Mumbai, New Delhi. Scripts: Devanagari, Tamil, Grantha, Telugu,
Kannada, Roman (ISO).

## Tabs

| Tab | What it shows |
|---|---|
| Panchanga | The samvatsara, ayana, ṛtu, solar and lunar months; sunrise, sunset, moonrise and moonset; the five aṅgas, each with when it ends and what follows (the one running now marked); rāhu kālam, yamagaṇḍam, gulika, durmuhūrtam and varjyam; abhijit and amṛta kālam; the moon's rāśi and the śūlam; the day's festivals. |
| Ashtanga | The dinanityāvidyā, large; the tithinityā (with the times the tithis change), dinanityā, kālanityā, tattvadivasa, vāsara, the nakṣatra, yoga and karaṇa letters and the ghaṭikodaya; the tattvavatsara, ṛtu, nityāmāsa and kalāmāsa, and the larger cycles; the viśeṣa puṇyakālas and devī parvas of the day, with their pūjā times (rātri-pūjā for the devī-parvas: pradoṣa and madhyarātri; for each mahāvidyā jayantī the kāla of the Ashtangam's table) and the navāvaraṇa-pūjā days marked; the next seven days. |
| Sankalpa | The Śākta Aṣṭāṅga sankalpa (as the Telegram bot [t.me/ashtangam](https://t.me/ashtangam) and the Ashtangam print it), the pañcāṅga sankalpa, or both combined (pañcāṅga, then aṣṭāṅga, then the dinanityāvidyā, as in the daily ICS). As printed, from sunrise, with each change and its time in brackets; in Devanagari, with Devanagari digits. Large type, A−/A+, copy and share; the copied text is set for WhatsApp (its *bold*, one phrase to a line). |
| Festivals | The Kali year's festivals by month, opening at today: the Ashtanga ones (devī parvas, pañca-parva pūjās including the saṅkramaṇa, the daśa-mahāvidyā jayantīs, the navarātras, the viśeṣa puṇyakālas), or the panchanga ones, with search. |
| About | Asthika Dharmam; the Ashtangam, with a page "What is the Ashtangam?" (Śrī Kāñcī Mahāsvāmī's direction of 1973, in English and Tamil); ordering the panchangam; the WhatsApp, Telegram and YouTube channels; settings (city, script, theme, clock, text size); acknowledgements; the data. |

Each day has an address: `#ashtanga/2026-11-20`. Swipe or use the arrow keys to change the day.
With no date in the address, the app shows the current sankalpa day: until this morning's sunrise,
that is yesterday.

## How the Ashtanga is reckoned

`js/ashtanga.js` ports `get_ashtanga_data_jd`, `get_ashtanga_details` and `get_ashtanga_sankalpa`
from `kamakoti-panchangam/ashtanga/bin`. Except for the tithinityā, everything is arithmetic on the
kalyahargaṇa *k*: the number of days from the Kali epoch (JD 588465.5) to the day's sunrise. The
"Ashtangam Calculation" sheet sets this out the same way.

| Aṅga | From |
|---|---|
| udayaghaṭikā | *k* mod 5 |
| vāsara | *k* mod 9 |
| dinanityā | *k* mod 30 |
| kālanityā | *k* mod 16 |
| tattvadivasa; nakṣatra, yoga, karaṇa letters | *k* mod 36 |
| nityāmāsa, kalāmāsa | ⌊*k*/36⌋ mod 16 (ṛtu: half of it) |
| tattvavatsara | ⌊*k*/576⌋ mod 36 |
| tattva-parivṛtti | ⌊*k*/20736⌋ mod 36 |
| tattvayuga | ⌊*k*/746496⌋ mod 36 |
| tattva-mahāyuga, kalpa, mahākalpa | fixed: tvak, cakṣuḥ, ghrāṇam |
| tithinityā | the tithi at sunrise, and any tithi that begins within 40 ghaṭikās of sunrise |

A viśeṣa puṇyakāla is a day on which the listed aṅgas all begin with the same letter. The rules are
in the PDF's table and in `VISESHA`.

The name tables are in `tools/ashtanga_hk.json` (Harvard-Kyoto). They are spelt as in the
Ashtangam PDF's tables and the calculation sheet; a few spellings differ from those of the 2026
ICS (अं आं श्रीकरी for अम् आं, घ्राणम्, ओं सर्वमङ्गला).

**Checked against the Telegram ICS:** every day of 2026 for Chennai (Madrapurī) agrees with
`Madrapuri-2026-devanagari-daily-ashtanga-sankalpa.ics`, apart from those spellings:

```bash
python3 tools/ics2json.py Madrapuri-2026-devanagari-daily-ashtanga-sankalpa.ics /tmp/ics.json
```

```bash
node tools/check_ashtanga.mjs /tmp/ics.json Chennai
```

The ICS generator's nityāmelana test never fires (it compares the tithinityā's last word). This
app follows the monthly generator, which compares the first, and the PDF marks नित्यामेलनम्
accordingly.

The pañcāṅga sankalpa is `js/sankalpa.js` from the panchaanga, unchanged.

## Data

`data/` is copied from the panchaanga's published data (the `data/` folder of
[adyatithi/panchaanga](https://github.com/adyatithi/panchaanga)), cut down to this app's cities
and fields. The app reads only its own copy and never fetches from the panchaanga site.

```bash
pip install indic_transliteration
```

```bash
python3 tools/build_data.py --src ../panchaanga/data
```

To change the cities, pass `--cities Chennai,Kanchipuram,Mumbai,NewDelhi`, using the panchaanga's
city ids. The script writes:

- `data/index.json`: the cities and their years.
- `data/c/<city>/<kali>.json`: a Kali year of days, about 250 KB before compression.
- `data/s/<script>.json`: the names in each script, the festival names, and the Ashtanga tables.

`.github/workflows/data.yml` rebuilds `data/` every Monday from the panchaanga repository and
commits it if anything changed.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Publish

`.github/workflows/pages.yml` publishes the folder to GitHub Pages on every push to `main`. To set
it up, go to Settings → Pages → Source and choose GitHub Actions. After changing any file under
`js/` or `css/`, raise `VERSION` in `sw.js` so that installed copies pick up the change.
