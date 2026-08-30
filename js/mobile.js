/* The phone version. Not a shrunken desktop: the same content, three
   screens, one idea each.

   1. The gate (shared with the desktop): WELCOME, the gold mark, tap.
   2. Home, laid out like a phone launcher: the big clock and the date,
      a status line, two small widgets (now playing, who I am), then the
      categories as a list of rows: the 3D icon on the left, the name.
      The selected row is outlined in its own colour, shows a one line
      subtitle, and its icon revolves. Tap a row to select it, tap the
      selected row to open it. Arrow keys and Enter do the same.
   3. The page: everything in that category as one clean scroll, item by
      item (title, lines, media, bullets, links, the form on PEOPLE), with
      a back button to home.

   Runs only under 760 px (config.MOBILE). The desktop cross stays in the
   DOM but hidden, so deep links and the tests keep their meaning. */

import { CATEGORIES } from './menu.js';
import { spin } from './icon3d.js';
import { emit, bus, REDUCED } from './config.js';

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

/* one line under the selected row */
const TAGLINE = {
  about: 'who I am, in one screen',
  work: 'Amazon to AXA to AI native startups',
  education: 'the schools, with the diplomas',
  play: 'projects with a demo to watch',
  people: 'what colleagues say, add yours',
  trophies: 'certifications, click to verify',
  contact: 'email, GitHub, LinkedIn, Hugging Face'
};

export function initMobile({ buildRecForm }) {
  const N = CATEGORIES.length;
  const TILT = 30 * Math.PI / 180;
  const root = el('div', 'mob');
  document.body.appendChild(root);

  /* ---------- 2. home ---------- */
  const home = el('section', 'mob-home');
  root.appendChild(home);

  const clock = el('div', 'mob-clock');
  const time = el('div', 'mob-clock__time');
  const date = el('div', 'mob-clock__date');
  clock.appendChild(time);
  clock.appendChild(date);
  home.appendChild(clock);
  const tickClock = () => {
    const d = new Date();
    time.textContent = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    date.textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };
  tickClock();
  setInterval(tickClock, 15000);

  home.appendChild(el('div', 'mob-status', 'AI ENGINEER  ·  PARIS  ·  OPEN TO WORK'));

  /* widgets: now playing mirrors the (hidden) player pill; the second is
     the name card */
  const widgets = el('div', 'mob-widgets');
  const wPlay = el('button', 'mob-widget');
  wPlay.type = 'button';
  const wPlayHead = el('div', 'mob-widget__head', 'NOW PLAYING');
  const wPlayTitle = el('div', 'mob-widget__title', '…');
  const wPlaySub = el('div', 'mob-widget__sub', 'tap to play');
  wPlay.appendChild(wPlayHead); wPlay.appendChild(wPlayTitle); wPlay.appendChild(wPlaySub);
  wPlay.addEventListener('click', () => document.getElementById('pillPlay')?.click());
  const wMe = el('div', 'mob-widget');
  wMe.appendChild(el('div', 'mob-widget__head', 'ABHISHEK THOMAS'));
  wMe.appendChild(el('div', 'mob-widget__title', 'AI Engineer'));
  wMe.appendChild(el('div', 'mob-widget__sub', 'LLM evals · RAG · agents'));
  widgets.appendChild(wPlay);
  widgets.appendChild(wMe);
  home.appendChild(widgets);
  const syncPlay = () => {
    const t = document.getElementById('pillTitle')?.textContent || '';
    const playing = document.getElementById('pillPlay')?.getAttribute('aria-label') === 'Pause';
    wPlayTitle.textContent = t.split(' ')[0] || 'radio';
    wPlaySub.textContent = playing ? 'playing · tap to pause' : 'tap to play';
  };
  syncPlay();
  setInterval(syncPlay, 1000);

  /* the category rows */
  const rows = el('div', 'mob-rows');
  home.appendChild(rows);
  const rowEls = CATEGORIES.map((cat, i) => {
    const r = el('button', 'mob-row');
    r.type = 'button';
    r.style.setProperty('--key', cat.key);
    const cv = el('canvas', 'glyph3d');
    cv.dataset.d = cat.svg || '';
    const text = el('div', 'mob-row__text');
    text.appendChild(el('div', 'mob-row__name', cat.label));
    text.appendChild(el('div', 'mob-row__sub', TAGLINE[cat.id] || `${cat.items.length} entries`));
    const go = el('span', 'mob-row__go');
    go.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    r.appendChild(cv);
    r.appendChild(text);
    r.appendChild(go);
    r.addEventListener('click', () => { if (i === ci) open(i); else select(i); });
    rows.appendChild(r);
    return { r, cv };
  });
  let ci = 0;

  function paint() {
    rowEls.forEach(({ r, cv }, i) => {
      r.classList.toggle('is-on', i === ci);
      if (REDUCED) return;
      spin(cv, i === ci
        ? { group: 'm-row-' + i, fit: .8, speed: 1 }
        : { group: 'm-row-' + i, fit: .72, angle: TILT, speed: 0 });
    });
  }
  function select(i) {
    ci = (i + N) % N;
    paint();
    rowEls[ci].r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    emit('cat', { id: CATEGORIES[ci].id });
  }
  addEventListener('keydown', e => {
    if (!document.body.classList.contains('mobile') || document.body.classList.contains('booting')) return;
    if (e.target instanceof Element && e.target.matches('input, textarea, select')) return;
    if (root.classList.contains('mob--page')) { if (e.key === 'Escape') back(); return; }
    if (e.key === 'ArrowDown') { select(ci + 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { select(ci - 1); e.preventDefault(); }
    else if (e.key === 'Enter') open(ci);
  });

  /* ---------- 3. the page ---------- */
  const page = el('section', 'mob-page');
  const head = el('header', 'mob-head');
  const backBtn = el('button', 'mob-back');
  backBtn.type = 'button';
  backBtn.setAttribute('aria-label', 'Back');
  backBtn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
  const headTitle = el('h2', 'mob-head__title');
  head.appendChild(backBtn);
  head.appendChild(headTitle);
  const list = el('div', 'mob-list');
  page.appendChild(head);
  page.appendChild(list);
  root.appendChild(page);
  backBtn.addEventListener('click', back);

  const put = (host, cls, text, tag = 'p') => {
    if (!text) return null;
    const e = el(tag, cls, text);
    host.appendChild(e);
    return e;
  };
  const link = (href, cls, text) => {
    const a = el('a', cls, text);
    a.href = href;
    if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };

  function renderItem(item) {
    const art = el('article', 'mob-item');
    const text = el('div', 'mob-item__text');
    put(text, 'hero__sub', item.sub);
    const vid = item.video ? (item.video.match(/(?:youtu\.be\/|[?&]v=)([\w-]{6,})/) || [])[1] : null;
    const action = (item.action && !(vid && /youtu/.test(item.action.href))) ? item.action : null;
    const h1 = el('h1', 'hero__title');
    if (action) h1.appendChild(link(action.href, '', item.title));
    else h1.textContent = item.title;
    text.appendChild(h1);
    put(text, 'hero__meta', item.meta);

    /* the media: video, photos, or the logo / badge / portrait, LEFT */
    let media = null;
    if (vid) {
      media = el('iframe', 'hero__video');
      media.src = `https://www.youtube-nocookie.com/embed/${vid}`;
      media.allow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';
      media.allowFullscreen = true;
      media.loading = 'lazy';
    } else if (item.photos && item.photos.length) {
      media = el('div', item.photos.length === 1 ? 'mboard mboard--one' : 'mboard');
      item.photos.slice(0, 4).forEach(p => {
        const img = el('img');
        img.src = 'assets/' + p; img.alt = ''; img.loading = 'lazy';
        media.appendChild(img);
      });
    } else if (item.logo || item.icon) {
      media = el('img', item.person ? 'hero__logo hero__logo--person'
        : item.shape ? 'hero__logo hero__logo--shape' : 'hero__logo');
      media.src = item.icon ? 'assets/afaicon.png' : 'assets/' + item.logo;
      media.alt = ''; media.loading = 'lazy';
    }

    put(text, 'side__desc', item.body);
    if (item.bullets && item.bullets.length) {
      const ul = el('ul', 'hero__bullets');
      item.bullets.forEach(b => ul.appendChild(el('li', '', b)));
      text.appendChild(ul);
    }
    put(text, 'hero__stack', item.stack);

    /* links: the action as a button, the cards as text links */
    const links = (item.cards || []).filter(c => c.href);
    if (action || links.length) {
      const row = el('div', 'rail-links');
      if (action) row.appendChild(link(action.href, 'btn', action.label));
      links.forEach(c => {
        const a = link(c.href, 'plink', c.title);
        if (c.body) a.appendChild(el('span', 'plink__host', c.body));
        row.appendChild(a);
      });
      text.appendChild(row);
    }

    if (media) {
      art.classList.add('mob-item--split');
      const box = el('div', 'mob-item__media');
      box.appendChild(media);
      art.appendChild(box);
    }
    art.appendChild(text);
    if (item.form && buildRecForm) art.appendChild(buildRecForm());
    return art;
  }

  function open(i) {
    const cat = CATEGORIES[i];
    headTitle.textContent = cat.label;
    list.replaceChildren();
    cat.items.forEach(item => list.appendChild(renderItem(item)));
    root.classList.add('mob--page');
    page.scrollTop = 0;
    emit('act');
  }
  function back() {
    root.classList.remove('mob--page');
    paint();
    emit('cat', { id: CATEGORIES[ci].id });
  }

  /* deep links: ?cat=play selects that row, &open=1 opens the page */
  const q = new URLSearchParams(location.search);
  if (q.has('cat')) {
    const n = CATEGORIES.findIndex(c => c.id === q.get('cat'));
    if (n >= 0) ci = n;
  }
  paint();
  /* the home is hidden behind the gate at load, so its canvases have no
     size yet: paint again on the frame after the gate opens */
  bus.addEventListener('start', () => requestAnimationFrame(paint));
  addEventListener('resize', () => { if (!root.classList.contains('mob--page')) paint(); });
  if (q.has('open')) open(ci);

  return { select, open, back, get index() { return ci; } };
}
