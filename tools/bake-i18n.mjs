/* Bake translations: harvest every site string, translate each one once,
   write locales/<lang>.json. Incremental: strings already in a locale
   file are never re-translated, so re-runs cost seconds. Run at deploy:
     node tools/bake-i18n.mjs                                        */

import { CATEGORIES } from '../js/menu.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'locales');
mkdirSync(out, { recursive: true });

const LANGS = ['fr', 'de', 'es', 'it', 'pt'];

/* interface strings that live in html/js, not in the data */
const UI = [
  'THEME', 'LANGUAGE', 'PRESS ANY KEY', 'AI ENGINEER · PARIS',
  'ROYAL BLUE', 'BEACH', 'LAVA LAMP', 'SPACE',
  'nothing found', 'submit for approval', '+ photo', 'Sending…',
  'Sent! It appears here once Abhishek approves it. Thank you!',
  'Something went wrong, please try again in a minute.',
  'Submissions are switching on very soon. Come back in a day!',
  'ADD YOURS', 'PARIS · OPEN TO WORK'
];

const strings = new Set(UI);
/* names, brands, domains and emails are NEVER translated */
const SKIP = new Set([
  'ABHISHEK THOMAS', 'VISTIQ.AI', 'AXA FRANCE', 'EXL SERVICES', 'MATHCO',
  'AMAZON', 'EMLYON', 'MCGILL', 'SVNIT SURAT', 'KICKY AI', 'MEMORY BRIDGEAI',
  'RIZZUME', 'NOTME', 'MEDICAL RAG', 'PIKA PAL AI', 'AWS ML SPECIALTY',
  'AWS CLOUD PRACTITIONER', 'DGM · IISc', 'IISc Bangalore',
  'Amazon Web Services', 'GITHUB', 'LINKEDIN', 'HUGGING FACE'
]);
const take = s => {
  if (typeof s !== 'string') return;
  const t = s.trim();
  if (t.length < 2 || !/[a-zA-Z]{2}/.test(t)) return;
  if (SKIP.has(t)) return;
  if (/[.]\w{2,3}($|\/)|@/.test(t)) return;   /* domains and emails */
  strings.add(t);
};
for (const cat of CATEGORIES) {
  take(cat.label);
  for (const it of cat.items) {
    take(it.title); take(it.sub); take(it.meta); take(it.body);
    (it.bullets || []).forEach(take);
    (it.cards || []).forEach(c => { take(c.title); take(c.body); });
  }
}
const all = [...strings];
console.log(all.length, 'strings,', LANGS.length, 'languages');

async function translate(text, lang) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl='
    + encodeURIComponent(lang) + '&dt=t&q=' + encodeURIComponent(text);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.status === 429) throw new Error('rate limited');
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      const t = (data[0] || []).map(p => p[0]).join('');
      if (t) return t;
      throw new Error('empty');
    } catch (e) {
      if (attempt === 3) throw e;
      /* rate limits need PATIENCE, not retries */
      const wait = String(e).includes('rate') ? 30000 : 2000 * (attempt + 1);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

for (const lang of LANGS) {
  const file = join(out, lang + '.json');
  const dict = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const missing = all.filter(s => !dict[s]);
  if (!missing.length) { console.log(lang, 'up to date'); continue; }
  console.log(lang, ':', missing.length, 'to translate');
  let done = 0;
  const queue = missing.slice();
  const worker = async () => {
    while (queue.length) {
      const s = queue.shift();
      try {
        dict[s] = await translate(s, lang);
      } catch (e) {
        console.log('  FAILED:', lang, JSON.stringify(s.slice(0, 40)), e.message);
      }
      done++;
      if (done % 50 === 0) console.log(' ', lang, done + '/' + missing.length);
      await new Promise(r => setTimeout(r, 350));
    }
  };
  await worker();   /* single lane: the endpoint dislikes bursts */
  const sorted = Object.fromEntries(Object.entries(dict).sort((a, b) => a[0].localeCompare(b[0])));
  writeFileSync(file, JSON.stringify(sorted, null, 1));
  console.log(lang, 'written:', Object.keys(sorted).length, 'entries');
}
console.log('bake complete');
