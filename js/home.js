/* The home screen: two tabs, one tile rail, a hero, a shelf of cards.

   There is exactly one screen. Moving focus along the rail swaps the hero,
   the shelf and the background colour — nothing navigates anywhere. */

import { MOBILE, REDUCED, emit } from './config.js';
import { TABS } from './tiles.js';

const $ = sel => document.querySelector(sel);

export function initHome() {
  const tabsEl  = $('#tabs');
  const railEl  = $('#rail');
  const labelEl = $('#railLabel');
  const heroEl  = $('#hero');
  const shelfEl = $('#shelf');
  const dotsEl  = $('#dots');

  let tabI = 0;
  const focusOf = TABS.map(() => 0);

  /* ---------- tabs ---------- */
  TABS.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.type = 'button';
    b.textContent = t.label;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => setTab(i));
    tabsEl.appendChild(b);
  });

  /* ---------- rail ---------- */
  function buildRail() {
    railEl.replaceChildren();
    TABS[tabI].tiles.forEach((tile, i) => {
      const b = document.createElement('button');
      b.className = 'tile' + (tile.pinned ? ' tile--pinned' : '');
      b.type = 'button';
      b.style.setProperty('--key', tile.key);
      b.setAttribute('aria-label', tile.title);

      if (tile.icon) {
        b.classList.add('tile--icon');
        const img = document.createElement('img');
        img.src = 'assets/afaicon.png';
        img.alt = '';
        b.appendChild(img);
      } else {
        const m = document.createElement('span');
        m.className = 'tile__mark';
        m.textContent = tile.mark;
        /* Longer marks get a smaller cap height so every tile reads equally
           loud. Anything past three characters keeps the three-char size. */
        b.style.setProperty('--markscale',
          { 1: '.82', 2: '.54', 3: '.40' }[tile.mark.length] || '.40');
        b.appendChild(m);
      }

      b.addEventListener('click', () => {
        if (i === focusOf[tabI]) act();
        else setFocus(i);
      });
      railEl.appendChild(b);
    });

    dotsEl.replaceChildren();
    TABS[tabI].tiles.forEach(() => {
      const d = document.createElement('i');
      dotsEl.appendChild(d);
    });
  }

  /* ---------- hero + shelf ---------- */
  function renderTile(tile) {
    /* key art: the tile's own mark, blown up behind everything */
    const art = $('#keyart');
    art.replaceChildren();
    if (tile.icon) {
      const img = document.createElement('img');
      img.src = 'assets/afaicon.png';
      img.alt = '';
      art.appendChild(img);
    } else {
      art.textContent = tile.mark;
    }

    /* hero */
    heroEl.replaceChildren();
    if (tile.badge) {
      const bd = document.createElement('p');
      bd.className = 'hero__badge';
      bd.innerHTML = '<span class="stars">★★★★★</span>' + tile.badge;
      heroEl.appendChild(bd);
    }
    if (tile.sub) {
      const s = document.createElement('p');
      s.className = 'hero__sub';
      s.textContent = tile.sub;
      heroEl.appendChild(s);
    }
    const h = document.createElement('h1');
    h.className = 'hero__title';
    h.textContent = tile.title;
    heroEl.appendChild(h);

    if (tile.meta) {
      const m = document.createElement('p');
      m.className = 'hero__meta';
      m.textContent = tile.meta;
      heroEl.appendChild(m);
    }
    if (tile.action) {
      const a = document.createElement('a');
      a.className = 'btn';
      a.href = tile.action.href;
      a.textContent = tile.action.label;
      if (!tile.action.href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      heroEl.appendChild(a);
    }

    /* shelf */
    shelfEl.replaceChildren();
    (tile.cards || []).forEach(c => {
      const el = document.createElement(c.href ? 'a' : 'article');
      el.className = 'card' + (c.big ? ' card--big' : '');
      if (c.href) {
        el.href = c.href;
        el.target = '_blank';
        el.rel = 'noopener';
      }
      if (c.init) {
        const av = document.createElement('span');
        av.className = 'card__avatar';
        av.textContent = c.init;
        el.appendChild(av);
      }
      if (c.kicker) {
        const k = document.createElement('p');
        k.className = 'card__kicker';
        k.textContent = c.kicker;
        el.appendChild(k);
      }
      if (c.title) {
        const t = document.createElement('p');
        t.className = 'card__title';
        t.textContent = c.title;
        el.appendChild(t);
      }
      if (c.sub) {
        const s = document.createElement('p');
        s.className = 'card__sub';
        s.textContent = c.sub;
        el.appendChild(s);
      }
      if (c.body) {
        const b = document.createElement('p');
        el.className += c.title || c.kicker ? '' : ' card--plain';
        b.className = 'card__body';
        b.textContent = c.body;
        el.appendChild(b);
      }
      shelfEl.appendChild(el);
    });
    shelfEl.scrollTo({ left: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  }

  /* ---------- focus ---------- */
  function setFocus(i, quiet) {
    const tiles = TABS[tabI].tiles;
    focusOf[tabI] = Math.max(0, Math.min(tiles.length - 1, i));
    const tile = tiles[focusOf[tabI]];

    [...railEl.children].forEach((el, n) => {
      el.classList.toggle('is-focus', n === focusOf[tabI]);
      el.tabIndex = n === focusOf[tabI] ? 0 : -1;
    });
    [...dotsEl.children].forEach((el, n) =>
      el.classList.toggle('is-on', n === focusOf[tabI]));

    document.documentElement.style.setProperty('--key', tile.key);
    labelEl.textContent = tile.title;

    centreRail();
    renderTile(tile);
    if (!quiet) emit('focus', { tile });
  }

  /* Hold the focused tile at a fixed x: centred on phones, inset on desktop. */
  function centreRail() {
    const el = railEl.children[focusOf[tabI]];
    if (!el) return;
    const anchor = MOBILE() ? (railEl.clientWidth - el.offsetWidth) / 2 : 0;
    railEl.scrollTo({
      left: Math.max(0, el.offsetLeft - anchor),
      behavior: REDUCED ? 'auto' : 'smooth'
    });
  }

  function setTab(i) {
    if (i === tabI) return;
    tabI = (i + TABS.length) % TABS.length;
    [...tabsEl.children].forEach((el, n) => {
      el.classList.toggle('is-on', n === tabI);
      el.setAttribute('aria-selected', n === tabI);
    });
    buildRail();
    setFocus(focusOf[tabI], true);
    emit('tab', { id: TABS[tabI].id });
  }

  function act() {
    const tile = TABS[tabI].tiles[focusOf[tabI]];
    const btn = heroEl.querySelector('.btn');
    if (btn) btn.click();
    else shelfEl.querySelector('.card')?.scrollIntoView({ block: 'nearest', inline: 'start' });
    return tile;
  }

  /* ---------- input ---------- */
  addEventListener('keydown', e => {
    if (document.body.classList.contains('booting')) return;
    const k = e.key;
    if (k === 'ArrowRight')      { setFocus(focusOf[tabI] + 1); e.preventDefault(); }
    else if (k === 'ArrowLeft')  { setFocus(focusOf[tabI] - 1); e.preventDefault(); }
    else if (k === 'ArrowUp')    { setTab(tabI - 1); e.preventDefault(); }
    else if (k === 'ArrowDown')  { setTab(tabI + 1); e.preventDefault(); }
    else if (k === 'Enter')      { act(); }
    else if (k === 'Escape')     { railEl.children[focusOf[tabI]]?.focus(); }
  });

  /* Wheel over the rail browses it; the rail never free-scrolls. */
  railEl.addEventListener('wheel', e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    const now = performance.now();
    if (now - (railEl._t || 0) < 220) return;
    railEl._t = now;
    setFocus(focusOf[tabI] + (d > 0 ? 1 : -1));
  }, { passive: false });

  /* Swipe: horizontal on the rail moves focus, vertical switches tab. */
  let sx = 0, sy = 0;
  addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (e.target.closest('#shelf')) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      setFocus(focusOf[tabI] + (dx < 0 ? 1 : -1));
    } else if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      setTab(tabI + (dy < 0 ? 1 : -1));
    }
  }, { passive: true });

  addEventListener('resize', centreRail);

  /* ---------- go ---------- */
  tabsEl.children[0].classList.add('is-on');
  tabsEl.children[0].setAttribute('aria-selected', 'true');
  buildRail();
  setFocus(0, true);

  return { setFocus, setTab, act };
}
