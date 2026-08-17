/* The Cross Media Bar.

   Horizontal = categories. Vertical = the items inside the selected category.
   They cross at a fixed point: the category bar's row, and the column directly
   beneath the active category. Both axes are tracks that translate, never
   scroll — a scrolling row does not move when its content already fits.

   Skin is PS5: near-black, one key colour per item driving the whole screen. */

import { emit } from './config.js';
import { CATEGORIES } from './menu.js';

const $ = s => document.querySelector(s);

export function initXmb() {
  const barEl    = $('#bar');
  const colEl    = $('#column');
  const colTrack = $('#columnTrack');
  const heroEl   = $('#hero');
  const shelfEl  = $('#shelf');
  const keyartEl = $('#keyart');

  let catI = 0;
  const itemOf = CATEGORIES.map(() => 0);

  /* ---------- marks and logos ---------- */
  /* A logo is used when the file exists; if it 404s we swap back to the mark,
     so logos can be added to assets/logos/ later without touching code. */
  function markInto(el, entry, cls) {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = entry.mark || '';
    if (entry.icon) {
      const img = document.createElement('img');
      img.src = 'assets/afaicon.png';
      img.alt = '';
      el.appendChild(img);
      return;
    }
    if (entry.logo) {
      const img = document.createElement('img');
      img.src = 'assets/logos/' + entry.logo;
      img.alt = '';
      img.className = 'logo';
      img.addEventListener('error', () => {
        /* A 404 arrives asynchronously, by which time this render may already
           have been replaced. Only fall back if the image is still mounted —
           otherwise the previous item's mark lands on the current one. */
        const parent = img.parentNode;
        if (!parent) return;
        img.remove();
        parent.appendChild(span);
      }, { once: true });
      el.appendChild(img);
      return;
    }
    el.appendChild(span);
  }

  /* ---------- the horizontal axis ---------- */
  function buildBar() {
    barEl.replaceChildren();
    CATEGORIES.forEach((cat, i) => {
      const b = document.createElement('button');
      b.className = 'cat';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(i === catI));
      b.style.setProperty('--key', cat.key);

      const icon = document.createElement('span');
      icon.className = 'cat__icon';
      markInto(icon, cat, 'cat__mark');
      b.appendChild(icon);

      const lab = document.createElement('span');
      lab.className = 'cat__label';
      lab.textContent = cat.label;
      b.appendChild(lab);

      b.addEventListener('click', () => setCat(i));
      barEl.appendChild(b);
    });
  }

  /* ---------- the vertical axis ---------- */
  function buildColumn() {
    colTrack.replaceChildren();
    CATEGORIES[catI].items.forEach((item, i) => {
      const b = document.createElement('button');
      b.className = 'item';
      b.type = 'button';
      b.style.setProperty('--key', item.key);
      b.setAttribute('aria-current', String(i === itemOf[catI]));

      const badge = document.createElement('span');
      badge.className = 'item__mark';
      markInto(badge, item, 'item__glyph');
      b.appendChild(badge);

      const name = document.createElement('span');
      name.className = 'item__name';
      name.textContent = item.title;
      b.appendChild(name);

      b.addEventListener('click', () => {
        if (i === itemOf[catI]) act();
        else setItem(i);
      });
      colTrack.appendChild(b);
    });
  }

  /* ---------- detail ---------- */
  function renderItem(item) {
    keyartEl.replaceChildren();
    markInto(keyartEl, item, 'keyart__mark');

    heroEl.replaceChildren();
    const add = (cls, text, tag = 'p') => {
      if (!text) return;
      const el = document.createElement(tag);
      el.className = cls;
      el.textContent = text;
      heroEl.appendChild(el);
    };

    if (item.badge) {
      const bd = document.createElement('p');
      bd.className = 'hero__badge';
      bd.innerHTML = '<span class="stars">★★★★★</span>' + item.badge;
      heroEl.appendChild(bd);
    }
    add('hero__sub', item.sub);
    add('hero__title', item.title, 'h1');
    add('hero__meta', item.meta);
    add('hero__body', item.body);

    if (item.action) {
      const a = document.createElement('a');
      a.className = 'btn';
      a.href = item.action.href;
      a.textContent = item.action.label;
      if (!item.action.href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      heroEl.appendChild(a);
    }

    shelfEl.replaceChildren();
    (item.cards || []).forEach(c => {
      const el = document.createElement(c.href ? 'a' : 'article');
      el.className = 'card';
      if (c.href) { el.href = c.href; el.target = '_blank'; el.rel = 'noopener'; }
      const put = (cls, text) => {
        if (!text) return;
        const p = document.createElement('p');
        p.className = cls;
        p.textContent = text;
        el.appendChild(p);
      };
      put('card__kicker', c.kicker);
      put('card__title', c.title);
      put('card__body', c.body);
      shelfEl.appendChild(el);
    });

    [...heroEl.children].forEach((el, n) => el.style.setProperty('--i', n));
    [...shelfEl.children].forEach((el, n) => el.style.setProperty('--i', Math.min(n, 8)));
    shelfEl.scrollLeft = 0;
  }

  /* ---------- movement ---------- */
  /* The crosspoint --crossx is a CONSTANT defined in CSS. The bar slides so
     the active category always parks exactly there — no clamping. On the
     first category the space left of the crosspoint is simply empty, the way
     a real XMB leaves it. The column reads the same constant, so the two
     always align and the column itself never moves horizontally.

     Clamping was the bug: it parked the first category at the page edge and
     every other one 106px in, so the column jumped between two positions. */
  function crossx() {
    return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--crossx')) || 0;
  }

  function slideBar() {
    const el = barEl.children[catI];
    if (!el) return;
    barEl.style.transform = `translateX(${Math.round(crossx() - el.offsetLeft)}px)`;
  }

  /* Vertical rule (user-specified): on the FIRST item the selection sits
     flush under the category — no reserved gap. From the second item on, the
     selection parks one row down and the box you came from fades above it.
     The column gets .column--athead at the first item so the top fade is
     removed there — otherwise the fade would cut across the selected ring. */
  function slideColumn() {
    const el = colTrack.children[itemOf[catI]];
    if (!el) return;
    const row = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--row')) || 46;
    colEl.classList.toggle('column--athead', itemOf[catI] === 0);
    colTrack.style.transform =
      `translateY(${Math.min(0, Math.round(row - el.offsetTop))}px)`;
  }

  function setItem(i, quiet) {
    const items = CATEGORIES[catI].items;
    /* circular, like the category bar: past the last item you are back at
       the first — the column takes the long slide home, same as the bar */
    itemOf[catI] = ((i % items.length) + items.length) % items.length;
    const item = items[itemOf[catI]];

    [...colTrack.children].forEach((el, n) => {
      const on = n === itemOf[catI];
      el.classList.toggle('is-on', on);
      el.setAttribute('aria-current', String(on));
      el.tabIndex = on ? 0 : -1;
    });

    document.documentElement.style.setProperty('--key', item.key);
    slideColumn();
    renderItem(item);
    if (!quiet) emit('focus', { item });
  }

  function setCat(i, quiet) {
    catI = (i + CATEGORIES.length) % CATEGORIES.length;
    [...barEl.children].forEach((el, n) => {
      el.classList.toggle('is-on', n === catI);
      el.setAttribute('aria-selected', String(n === catI));
      el.tabIndex = n === catI ? 0 : -1;
    });
    buildColumn();
    slideBar();
    setItem(itemOf[catI], true);
    if (!quiet) emit('cat', { id: CATEGORIES[catI].id });
  }

  function act() {
    const a = heroEl.querySelector('.btn');
    if (a) a.click();
  }

  /* ---------- input ---------- */
  addEventListener('keydown', e => {
    if (document.body.classList.contains('booting')) return;
    switch (e.key) {
      case 'ArrowRight': setCat(catI + 1); e.preventDefault(); break;
      case 'ArrowLeft':  setCat(catI - 1); e.preventDefault(); break;
      case 'ArrowDown':  setItem(itemOf[catI] + 1); e.preventDefault(); break;
      case 'ArrowUp':    setItem(itemOf[catI] - 1); e.preventDefault(); break;
      case 'Enter':      act(); break;
    }
  });

  /* Wheel: horizontal intent changes category, vertical walks the items. */
  let wheelAt = 0;
  addEventListener('wheel', e => {
    if (e.target.closest('#shelf')) return;
    const now = performance.now();
    if (now - wheelAt < 220) return;
    const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const d = horiz ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    wheelAt = now;
    if (horiz) setCat(catI + (d > 0 ? 1 : -1));
    else setItem(itemOf[catI] + (d > 0 ? 1 : -1));
  }, { passive: true });

  /* Swipe: the same cross. Sideways = category, up/down = item. */
  let sx = 0, sy = 0;
  addEventListener('touchstart', e => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (e.target.closest('#shelf')) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) setCat(catI + (dx < 0 ? 1 : -1));
    else if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx)) setItem(itemOf[catI] + (dy < 0 ? 1 : -1));
  }, { passive: true });

  /* Re-anchor after layout settles, not during the resize event itself. */
  let rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { slideBar(); slideColumn(); }, 120);
  });

  buildBar();
  setCat(0, true);

  return { setCat, setItem, act };
}
