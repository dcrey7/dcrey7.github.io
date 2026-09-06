/* The phone version. Not a shrunken desktop: the same content, three
   screens, one idea each.

   1. The gate (shared with the desktop): WELCOME, the gold mark, tap.
   2. Home, laid out like a phone lock screen: the big clock and the date,
      the player pill (disc, name, times, previous, play, next: the same
      element as on the desktop, moved here), then the categories as bare
      rows: the 3D icon on the left, the name centred. The selected row's
      icon revolves, its name is bold, a one line subtitle appears. Tap a
      row to select it, tap the selected row to open it. The top bar keeps
      only a hamburger; it opens the controls (search, language, sound,
      mode, theme).
   3. The page: the items of that category as rows in the same style
      (logo left, name centred) that drop down on a tap to show the words,
      bullets, links, the form. A back button returns home.

   Runs only under 760 px (config.MOBILE). The desktop cross stays in the
   DOM but hidden, so deep links and the tests keep their meaning. */

import { mountAvatar } from './avatar.js';
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
  const avatarStops = new Set();
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

  /* the player: the desktop's pill itself, moved under the clock (its
     script keeps working, it holds the children by id) */
  const pill = document.getElementById('pill');
  if (pill) home.appendChild(pill);

  /* the top bar: a hamburger opens the controls */
  const topbar = document.querySelector('.topbar');
  const burger = el('button', 'mob-menu');
  burger.type = 'button';
  burger.setAttribute('aria-label', 'Menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>';
  burger.addEventListener('click', e => {
    e.stopPropagation();
    const open = document.body.classList.toggle('mob-menu-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  addEventListener('click', e => {
    if (!e.target.closest('.sys') && document.body.classList.contains('mob-menu-open')) {
      document.body.classList.remove('mob-menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
  if (topbar) topbar.prepend(burger);

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

  /* one item = a row in the home's style (media left, name centred, a
     chevron) that drops down on a tap: words, bullets, stack, links, the
     form. The first item of a page starts open. */
  function renderItem(item, first) {
    const art = el('article', 'mob-item' + (first ? ' is-open' : ''));
    const head = el('div', 'mob-item__head');
    const more = el('div', 'mob-item__more');
    const vid = item.video ? (item.video.match(/(?:youtu\.be\/|[?&]v=)([\w-]{6,})/) || [])[1] : null;
    const action = (item.action && !(vid && /youtu/.test(item.action.href))) ? item.action : null;

    /* the media, left */
    let media = null;
    if (item.photos && item.photos.length) {
      media = el('img', 'hero__logo');
      media.src = 'assets/' + item.photos[0]; media.alt = ''; media.loading = 'lazy';
    } else if (item.logo || item.icon) {
      media = el('img', item.person ? 'hero__logo hero__logo--person'
        : item.shape ? 'hero__logo hero__logo--shape' : 'hero__logo');
      media.src = item.icon ? 'assets/afaicon.png' : 'assets/' + item.logo;
      media.alt = ''; media.loading = 'lazy';
    } else if (item.svg) {
      media = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      media.setAttribute('viewBox', '0 0 24 24');
      media.classList.add('glyph');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', item.svg); p.setAttribute('fill', 'currentColor');
      media.appendChild(p);
      art.style.setProperty('--key', item.key);
    } else if (item.mark) {
      media = el('span', 'mob-item__mark', item.mark);
      art.style.setProperty('--key', item.key);
    }
    const mediaBox = el('div', 'mob-item__media');
    if (media) mediaBox.appendChild(media);
    else art.classList.add('mob-item--nomedia');
    head.appendChild(mediaBox);

    /* the name, centred, with its line */
    const words = el('div', 'mob-item__words');
    put(words, 'hero__sub', item.sub);
    const h1 = el('h1', 'hero__title');
    if (action) {
      const a = link(action.href, '', item.title);
      a.addEventListener('click', e => e.stopPropagation());
      h1.appendChild(a);
    } else h1.textContent = item.title;
    words.appendChild(h1);
    head.appendChild(words);
    const chev = el('span', 'mob-item__chev');
    chev.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';
    head.appendChild(chev);
    let stopAvatar;
    const syncAvatar = () => {
      if (!item.avatar) return;
      if (art.classList.contains('is-open')) {
        if (!stopAvatar) { stopAvatar = mountAvatar(more, item.avatar); avatarStops.add(stopAvatar); }
      } else if (stopAvatar) {
        stopAvatar(); avatarStops.delete(stopAvatar); stopAvatar = undefined;
      }
    };
    head.addEventListener('click', () => { art.classList.toggle('is-open'); syncAvatar(); });
    syncAvatar();

    /* the drop down */
    put(more, 'hero__meta', item.meta);
    if (vid) {
      const f = el('iframe', 'hero__video');
      f.src = `https://www.youtube-nocookie.com/embed/${vid}`;
      f.allow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.loading = 'lazy';
      more.appendChild(f);
    }
    if (item.photos && item.photos.length > 1) {
      const board = el('div', 'mboard');
      item.photos.slice(1, 5).forEach(p => {
        const img = el('img');
        img.src = 'assets/' + p; img.alt = ''; img.loading = 'lazy';
        board.appendChild(img);
      });
      more.appendChild(board);
    }
    put(more, 'side__desc', item.body);
    if (item.bullets && item.bullets.length) {
      const ul = el('ul', 'hero__bullets');
      item.bullets.forEach(b => {
        const li = el('li');
        if (b && b.href) {
          const a = link(b.href, 'bullet-link', b.label);
          li.appendChild(a);
          li.appendChild(document.createTextNode(b.text));
        } else li.textContent = b;
        ul.appendChild(li);
      });
      more.appendChild(ul);
    }
    put(more, 'hero__stack', item.stack);
    const links = (item.cards || []).filter(c => c.href);
    if (action || links.length) {
      const row = el('div', 'rail-links');
      if (action) row.appendChild(link(action.href, 'btn', action.label));
      links.forEach(c => {
        const a = link(c.href, 'plink', c.title);
        if (c.body) a.appendChild(el('span', 'plink__host', c.body));
        row.appendChild(a);
      });
      more.appendChild(row);
    }
    if (item.form && buildRecForm) more.appendChild(buildRecForm());

    art.appendChild(head);
    art.appendChild(more);
    return art;
  }

  function open(i) {
    for (const stop of avatarStops) stop();
    avatarStops.clear();
    const cat = CATEGORIES[i];
    headTitle.textContent = cat.label;
    list.replaceChildren();
    cat.items.forEach((item, n) => list.appendChild(renderItem(item, n === 0)));
    root.classList.add('mob--page');
    page.scrollTop = 0;
    emit('act');
  }
  function back() {
    for (const stop of avatarStops) stop();
    avatarStops.clear();
    list.replaceChildren();
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
