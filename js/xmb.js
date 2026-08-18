/* The Cross Media Bar.

   Horizontal = categories. Vertical = the items inside the selected category.
   They cross at a fixed point: the category bar's row, and the column directly
   beneath the active category. Both axes are tracks that translate, never
   scroll — a scrolling row does not move when its content already fits.

   Skin is PS5: near-black, one key colour per item driving the whole screen. */

import { emit } from './config.js';
import { CATEGORIES } from './menu.js';
import { SUPA } from './data.js';

const $ = s => document.querySelector(s);

export function initXmb() {
  const barEl    = $('#bar');
  const mirrorEl = $('#barMirror');
  const colEl    = $('#column');
  const colTrack = $('#columnTrack');
  const heroEl   = $('#hero');
  const shelfEl  = $('#shelf');
  const keyartEl = $('#keyart');

  let catI = 0;
  const itemOf = CATEGORIES.map(() => 0);

  /* ---------- lightbox: click a photo, see it properly ---------- */
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.appendChild(document.createElement('img'));
  document.body.appendChild(lightbox);
  lightbox.addEventListener('click', () => lightbox.classList.remove('on'));
  const openLightbox = src => {
    lightbox.querySelector('img').src = src;
    lightbox.classList.add('on');
  };

  /* ---------- the ADD YOURS form (in-page, no redirects) ---------- */
  /* Submissions go to Supabase as PENDING rows; approved ones appear on the
     site. Until SUPA is configured in data.js, submit explains politely. */
  function buildRecForm() {
    const f = document.createElement('form');
    f.className = 'recform';
    f.innerHTML = `
      <label class="recform__photo">
        <input type="file" name="photo" accept="image/*" hidden>
        <span>+ photo</span>
      </label>
      <input name="name" placeholder="your name" required>
      <input name="role" placeholder="title & company" required>
      <input name="rel" placeholder="teammate / manager / mentor / client">
      <input name="year" placeholder="year we worked together">
      <input name="contact" placeholder="linkedin or email">
      <textarea name="quote" rows="5" placeholder="your recommendation" required></textarea>
      <button type="submit">submit for approval</button>
      <p class="recform__note" hidden></p>`;

    const photoInput = f.querySelector('input[type=file]');
    photoInput.addEventListener('change', () => {
      f.querySelector('.recform__photo span').textContent =
        photoInput.files[0] ? photoInput.files[0].name : '+ photo';
    });

    f.addEventListener('submit', async e => {
      e.preventDefault();
      const note = f.querySelector('.recform__note');
      note.hidden = false;
      if (!SUPA.url || !SUPA.anon) {
        note.textContent = 'Submissions are switching on very soon. Come back in a day!';
        return;
      }
      note.textContent = 'Sending…';
      try {
        const fd = new FormData(f);
        let photo_path = null;
        const file = photoInput.files[0];
        if (file) {
          photo_path = `pending/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;
          const up = await fetch(`${SUPA.url}/storage/v1/object/recs/${photo_path}`, {
            method: 'POST',
            headers: { apikey: SUPA.anon, Authorization: `Bearer ${SUPA.anon}` },
            body: file
          });
          if (!up.ok) throw new Error('photo upload failed');
        }
        const res = await fetch(`${SUPA.url}/rest/v1/recommendations`, {
          method: 'POST',
          headers: {
            apikey: SUPA.anon,
            Authorization: `Bearer ${SUPA.anon}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            name: fd.get('name'), role: fd.get('role'), rel: fd.get('rel'),
            year: fd.get('year'), contact: fd.get('contact'),
            quote: fd.get('quote'), photo_path, approved: false
          })
        });
        if (!res.ok) throw new Error('save failed');
        f.reset();
        note.textContent = 'Sent! It appears here once Abhishek approves it. Thank you!';
      } catch {
        note.textContent = 'Something went wrong, please try again in a minute.';
      }
    });
    return f;
  }

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
      img.src = 'assets/' + entry.logo;
      img.alt = '';
      img.className = 'logo';
      img.addEventListener('error', () => {
        /* A 404 arrives asynchronously, by which time this render may already
           have been replaced. Only fall back if the image is still mounted —
           otherwise the previous item's mark lands on the current one. */
        const parent = img.parentNode;
        if (!parent) return;
        img.remove();
        parent.classList.remove('has-img');
        parent.appendChild(span);
      }, { once: true });
      el.appendChild(img);
      /* an image is its OWN box — the coloured slab behind it disappears */
      el.classList.add('has-img');
      return;
    }
    el.appendChild(span);
  }

  /* ---------- the horizontal axis ---------- */
  function buildBar() {
    barEl.replaceChildren();
    mirrorEl.replaceChildren();
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
    /* the mirror deck: inert clones, one per card */
    [...barEl.children].forEach(c => {
      const m = c.cloneNode(true);
      m.tabIndex = -1;
      mirrorEl.appendChild(m);
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

      /* no mark, no icon, no logo: the name stands alone, no empty box */
      if (item.mark || item.icon || item.logo) {
        const badge = document.createElement('span');
        badge.className = 'item__mark';
        markInto(badge, item, 'item__glyph');
        b.appendChild(badge);
      }

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
    /* ONE uniform layout for every item (user spec):
       MIDDLE = heading top-left, then the media: the full video, else the
                photo board (masonry, hover air, click = lightbox), else the
                logo big enough to fill the space.
       RIGHT  = links on top, description or bullet points below.
       No badges, no stars: clean. */

    const put = (host, cls, text, tag = 'p') => {
      if (!text) return null;
      const el = document.createElement(tag);
      el.className = cls;
      el.textContent = text;
      host.appendChild(el);
      return el;
    };

    const photos = item.photos || [];
    const vid = item.video
      ? (item.video.match(/(?:youtu\.be\/|[?&]v=)([\w-]{6,})/) || [])[1]
      : null;
    /* the action IS the heading link — and never a duplicate of the
       embedded player */
    const action = (item.action && !(vid && /youtu/.test(item.action.href)))
      ? item.action : null;

    heroEl.replaceChildren();
    put(heroEl, 'hero__sub', item.sub);
    const h1 = document.createElement('h1');
    h1.className = 'hero__title';
    if (action) {
      const a = document.createElement('a');
      a.href = action.href;
      if (!action.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
      a.textContent = item.title;
      a.title = action.label;
      h1.appendChild(a);
    } else {
      h1.textContent = item.title;
    }
    heroEl.appendChild(h1);
    put(heroEl, 'hero__meta', item.meta);

    if (item.form) {
      heroEl.appendChild(buildRecForm());
    } else if (vid) {
      const frame = document.createElement('iframe');
      frame.className = 'hero__video';
      frame.src = `https://www.youtube-nocookie.com/embed/${vid}`;
      frame.title = `${item.title} demo`;
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      heroEl.appendChild(frame);
    } else if (photos.length) {
      const board = document.createElement('div');
      board.className = 'mboard';
      photos.slice(0, 6).forEach(f => {
        const img = document.createElement('img');
        img.src = 'assets/' + f;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener('click', () => openLightbox(img.src));
        board.appendChild(img);
      });
      heroEl.appendChild(board);
    } else if (item.logo || item.icon) {
      const img = document.createElement('img');
      img.className = 'hero__logo';
      img.src = item.icon ? 'assets/afaicon.png' : 'assets/' + item.logo;
      img.alt = '';
      if (action) {
        /* the logo itself is the action too */
        const a = document.createElement('a');
        a.href = action.href;
        if (!action.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
        a.appendChild(img);
        heroEl.appendChild(a);
      } else {
        heroEl.appendChild(img);
      }
    }

    /* the right rail: links on top, then the words */
    keyartEl.className = 'keyart-rail';
    keyartEl.replaceChildren();
    /* the rail carries only EXTRA links (blogs, spaces …) — the primary
       action sits with the heading, the video is embedded already */
    const links = [];
    (item.cards || []).forEach(c => {
      if (c.href) links.push({ title: c.title, href: c.href, host: c.body });
    });
    if (links.length) {
      const row = document.createElement('div');
      row.className = 'rail-links';
      links.forEach(l => {
        const a = document.createElement('a');
        a.className = 'plink';
        a.href = l.href;
        if (!l.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
        a.textContent = l.title;
        if (l.host) {
          const h = document.createElement('span');
          h.className = 'plink__host';
          h.textContent = l.host;
          a.appendChild(h);
        }
        row.appendChild(a);
      });
      keyartEl.appendChild(row);
    }
    put(keyartEl, 'side__desc', item.body);
    if (item.bullets && item.bullets.length) {
      const ul = document.createElement('ul');
      ul.className = 'hero__bullets';
      item.bullets.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        ul.appendChild(li);
      });
      keyartEl.appendChild(ul);
    }
    put(keyartEl, 'hero__stack', item.stack);

    shelfEl.replaceChildren();
    [...heroEl.children].forEach((el, n) => el.style.setProperty('--i', n));
    [...keyartEl.children].forEach((el, n) => el.style.setProperty('--i', n + 1));
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
    const tx = Math.round(crossx() - el.offsetLeft);
    barEl.style.transform = `translateX(${tx}px)`;
    mirrorEl.style.transform = `translateX(${tx}px) scaleY(-1)`;
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
    /* Coverflow deck, drawn with transforms over a constant layout pitch of
       one card width. Each side card is pulled toward the selection so it
       shows a KEEP sliver from under its neighbour; the selected card gets
       CLEAR of open space on both sides. Transforms never touch offsetLeft,
       so the crosspoint stays exact — animating layout margins did not. */
    const total = barEl.children.length;
    const catw = barEl.children[0] ? barEl.children[0].offsetWidth : 0;
    const KEEP = catw * .30, CLEAR = 0;   /* no clearance — a continuous deck */
    [...barEl.children].forEach((el, n) => {
      const d = n - catI, k = Math.abs(d), dir = Math.sign(d);
      el.classList.toggle('is-on', d === 0);
      el.classList.toggle('cat--before', d < 0);
      el.classList.toggle('cat--after', d > 0);
      const tx = d === 0 ? 0 : dir * (CLEAR - (k - 1) * (catw - KEEP));
      el.style.transform = `translateX(${Math.round(tx)}px)`;
      el.style.zIndex = total - k;
      el.setAttribute('aria-selected', String(d === 0));
      el.tabIndex = d === 0 ? 0 : -1;
    });
    /* the mirror deck follows the real one, card for card */
    if (mirrorEl.children.length === barEl.children.length) {
      [...barEl.children].forEach((src, n) => {
        const m = mirrorEl.children[n];
        m.className = src.className;
        m.style.transform = src.style.transform;
        m.style.zIndex = src.style.zIndex;
      });
    }
    buildColumn();
    slideBar();
    setItem(itemOf[catI], true);
    if (!quiet) emit('cat', { id: CATEGORIES[catI].id });
  }

  function act() {
    /* enter opens the primary action at the heading, else a rail link */
    const a = heroEl.querySelector('a') || keyartEl.querySelector('a');
    if (a) a.click();
  }

  /* ---------- input ---------- */
  addEventListener('keydown', e => {
    if (document.body.classList.contains('booting')) return;
    if (lightbox.classList.contains('on')) {
      if (e.key === 'Escape' || e.key === 'Enter') lightbox.classList.remove('on');
      return;
    }
    switch (e.key) {
      case 'ArrowRight': setCat(catI + 1); e.preventDefault(); break;
      case 'ArrowLeft':  setCat(catI - 1); e.preventDefault(); break;
      case 'ArrowDown':  setItem(itemOf[catI] + 1); e.preventDefault(); break;
      case 'ArrowUp':    setItem(itemOf[catI] - 1); e.preventDefault(); break;
      case 'Enter':      act(); break;
    }
  });

  /* Wheel: WHERE you scroll decides what moves. Over the category deck
     the wheel walks the category cards, over the vertical menu it walks
     the items, over the side rail it scrolls the text natively.
     Anywhere else the wheel axis decides, as before. */
  let wheelAt = 0;
  addEventListener('wheel', e => {
    if (e.target.closest('#shelf') || e.target.closest('.keyart-rail')) return;
    const now = performance.now();
    if (now - wheelAt < 220) return;
    const overDeck = !!e.target.closest('.barwrap');
    const overMenu = !!e.target.closest('.column');
    const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const d = horiz ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    wheelAt = now;
    if (overDeck) setCat(catI + (d > 0 ? 1 : -1));
    else if (overMenu) setItem(itemOf[catI] + (d > 0 ? 1 : -1));
    else if (horiz) setCat(catI + (d > 0 ? 1 : -1));
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
