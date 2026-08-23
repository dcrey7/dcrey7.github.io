/* Boot order: cross media bar renders → boot gate → player → clock. */

import { initXmb } from './xmb.js';
import { initBoot } from './boot.js';
import { YT_PLAYLISTS } from './data.js';
import { CATEGORIES } from './menu.js';

const xmb = initXmb();
initBoot();

/* Deep link: ?cat=play&i=1 opens a category on a given item. */
const q = new URLSearchParams(location.search);
if (q.has('cat')) {
  const names = ['about', 'work', 'education', 'play', 'people', 'trophies', 'contact'];
  const n = names.indexOf(q.get('cat'));
  if (n >= 0) xmb.setCat(n, true);
}
if (q.has('i')) xmb.setItem(Number(q.get('i')) || 0, true);

/* ---------- the radio ----------
   saloon.wtf style, zero hardcoded songs: paste YouTube PLAYLIST links in
   data.js and the player loads the whole playlist itself. The current
   song's REAL title and channel come from the player at runtime
   (getVideoData), prev/next skip real tracks, clicking the disc cycles
   playlists. The video is parked off-screen; the audio plays. */
const pill = document.getElementById('pill');
const listIds = YT_PLAYLISTS
  .map(u => (String(u).match(/[?&]list=([\w-]+)/) || [])[1])
  .filter(Boolean);
if (listIds.length) {
  pill.hidden = false;
  const disc = document.getElementById('pillDisc');
  const title = document.getElementById('pillTitle');
  const titleWrap = document.getElementById('pillTitleWrap');
  const prog = document.getElementById('pillProg');
  const timeCur = document.getElementById('pillTimeCur');
  const timeTot = document.getElementById('pillTimeTot');
  const btnPlay = document.getElementById('pillPlay');
  /* the OPENER is always the first song of the first playlist; after it,
     everything is random playlist + random song */
  let yt = null, curList = 0, lastId = null, lastTitle = '', lastHop = 0,
      phase = 0, wantRandomIndex = false,
      userPaused = false, startedOnce = false, errAt = 0, errStreak = 0,
      stuckTicks = 0;

  const hopRandom = () => {
    /* always land on a DIFFERENT playlist than the current one */
    const others = listIds.map((_, i) => i).filter(i => i !== curList);
    curList = others.length
      ? others[Math.floor(Math.random() * others.length)]
      : curList;
    lastHop = Date.now();
    wantRandomIndex = true;
    yt.loadPlaylist({ listType: 'playlist', list: listIds[curList] });
  };

  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  /* identical-footprint SVG icons — text glyphs render at differing sizes */
  const ICON_PLAY =
    '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';
  const ICON_PAUSE =
    '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" fill="currentColor"/><rect x="9.4" y="2" width="3.6" height="12" fill="currentColor"/></svg>';

  const refresh = () => {
    if (!yt || !yt.getVideoData) return;
    const d = yt.getVideoData() || {};
    /* never write blanks: mid-switch YouTube reports empty metadata for
       a beat. A long name becomes a slow TRAIN: doubled text scrolling
       through the middle slot. Rebuilt only when the song changes. */
    if (d.title && d.title !== lastTitle) {
      lastTitle = d.title;
      title.textContent = d.title;
      titleWrap.classList.remove('scrolls');
      requestAnimationFrame(() => {
        if (title.scrollWidth > titleWrap.clientWidth + 2) {
          title.textContent = d.title + '\u2003\u2003\u2003' + d.title + '\u2003\u2003\u2003';
          titleWrap.classList.add('scrolls');
        }
      });
    }
    if (d.video_id && d.video_id !== lastId) {
      disc.src = `https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg`;
      if (lastId && phase === 0) {
        /* the opener just finished: enter the randomized era */
        phase = 1;
        hopRandom();
      } else if (lastId && phase === 1 &&
                 listIds.length > 1 && Date.now() - lastHop > 30000 &&
                 Math.random() < .35) {
        /* and keep hopping between playlists mid-mix */
        hopRandom();
      }
      lastId = d.video_id;
    }
  };

  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  api.async = true;
  document.head.appendChild(api);
  window.onYouTubeIframeAPIReady = () => {
    yt = window.__yt = new YT.Player('radio-host', {
      width: 320, height: 180,
      playerVars: {
        listType: 'playlist', list: listIds[curList],
        controls: 0, disablekb: 1, playsinline: 1
      },
      events: {
        /* big playlists carry embed-blocked songs: skip them; if errors
           chain, hop to another playlist. The radio must never stall. */
        onError: () => {
          const now = Date.now();
          errStreak = now - errAt < 15000 ? errStreak + 1 : 1;
          errAt = now;
          if (errStreak >= 3) { errStreak = 0; phase = 1; hopRandom(); }
          else if (yt && yt.nextVideo) yt.nextVideo();
        },
        onReady: refresh,
        onStateChange: e => {
          const playing = e.data === YT.PlayerState.PLAYING;
          disc.classList.toggle('spin', playing);
          btnPlay.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
          btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
          if (playing) { startedOnce = true; userPaused = false; }
          /* after a random hop lands: shuffle the list and jump to a
             random SONG inside it */
          if (playing && wantRandomIndex) {
            const pl = yt.getPlaylist && yt.getPlaylist();
            if (pl && pl.length) {
              wantRandomIndex = false;
              yt.setShuffle(true);
              yt.playVideoAt(Math.floor(Math.random() * pl.length));
            }
          }
          /* end of a whole playlist: roll into a random one and keep going */
          if (e.data === YT.PlayerState.ENDED) { phase = 1; hopRandom(); }
          refresh();
        }
      }
    });
  };

  btnPlay.addEventListener('click', () => {
    if (!yt || !yt.getPlayerState) return;
    const st = yt.getPlayerState();
    /* playing OR buffering both count as "on", so pause always lands */
    if (st === 1 || st === 3) {
      userPaused = true;
      yt.pauseVideo();
    } else {
      userPaused = false;
      yt.playVideo();
    }
  });

  /* watchdog: if the radio sits idle without the user pausing it, nudge it
     back to life; a second stall in a row hops to another playlist */
  setInterval(() => {
    if (!yt || !yt.getPlayerState || !startedOnce || userPaused) return;
    const st = yt.getPlayerState();
    if (st === -1 || st === 0 || st === 5) {
      stuckTicks += 1;
      if (stuckTicks >= 2) { stuckTicks = 0; phase = 1; hopRandom(); }
      else yt.playVideo();
    } else {
      stuckTicks = 0;
    }
  }, 6000);

  /* NO autoplay (user rule): the radio sits loaded and quiet until the
     play button is pressed. */
  document.getElementById('pillPrev').addEventListener('click', () => yt && yt.previousVideo());
  document.getElementById('pillNext').addEventListener('click', () => yt && yt.nextVideo());
  /* the disc itself cycles between the playlists */
  disc.addEventListener('click', () => {
    if (!yt || listIds.length < 2) return;
    curList = (curList + 1) % listIds.length;
    yt.loadPlaylist({ listType: 'playlist', list: listIds[curList] });
  });

  setInterval(() => {
    if (!yt || !yt.getDuration) return;
    const d = yt.getDuration() || 0, p = yt.getCurrentTime() || 0;
    if (d) {
      prog.style.width = (p / d * 100) + '%';
      timeCur.textContent = mmss(p);
      timeTot.textContent = mmss(d);
    }
    refresh();
  }, 800);
}

/* ---------- themes ----------
   The settings gear, top left, swaps the backdrop. Shader themes are the
   self-contained WebGL pages in themes/, embedded full screen behind the
   bar with their own UI hidden. The choice persists. */
const THEME_SRC = {
  beach: 'themes/beach.html',
  lava: 'themes/lava.html',
  space: 'themes/space.html'
};
const gearBtn = document.getElementById('gearBtn');
const themenu = document.getElementById('themenu');

function applyTheme(name) {
  document.querySelectorAll('.themeframe').forEach(f => f.remove());
  document.body.dataset.theme = name;
  if (THEME_SRC[name]) {
    const f = document.createElement('iframe');
    f.className = 'themeframe';
    /* space is the one theme with two FACES: stars at night, a flock of
       birds by day */
    f.src = name === 'space' && document.body.classList.contains('light')
      ? 'themes/birds.html'
      : THEME_SRC[name];
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    f.addEventListener('load', () => {
      /* same origin: hide the shader page's own panels and wordmark */
      try {
        const style = f.contentDocument.createElement('style');
        style.textContent = '#ui, #debug, #game-container { display: none !important; }';
        f.contentDocument.head.appendChild(style);
        /* a fresh frame inherits the current dark/light mode */
        syncFrameMode(document.body.classList.contains('light'));
      } catch { /* leave the page as it is */ }
    });
    document.body.prepend(f);
  }
  themenu.querySelectorAll('button').forEach(b =>
    b.setAttribute('aria-current', String(b.dataset.theme === name)));
  try { localStorage.setItem('xmb-theme', name); } catch {}
}

/* every top bar dropdown behaves the same: its button toggles it, any
   click elsewhere closes it, opening one closes the others */
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const drops = [
  [gearBtn, themenu],
  [document.getElementById('searchBtn'), document.getElementById('searchPanel')],
  [document.getElementById('langBtn'), document.getElementById('langMenu')]
];
function closeDrops() {
  drops.forEach(([b, m]) => {
    m.hidden = true;
    b.setAttribute('aria-expanded', 'false');
  });
}
drops.forEach(([b, m]) => {
  b.addEventListener('click', e => {
    e.stopPropagation();
    const open = m.hidden;
    closeDrops();
    m.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
    if (open && m.id === 'searchPanel') searchInput.focus();
  });
});
addEventListener('pointerdown', e => {
  if (!e.target.closest('.settings')) closeDrops();
});
themenu.addEventListener('click', e => {
  const b = e.target.closest('button[data-theme]');
  if (!b) return;
  applyTheme(b.dataset.theme);
  closeDrops();
});

/* ---------- search: every item on the bar, one box ---------- */
const searchIndex = [];
CATEGORIES.forEach((c, ci) => c.items.forEach((it, ii) => searchIndex.push({
  ci, ii, cat: c.label, title: it.title,
  hay: [it.title, it.sub, it.meta, it.body].filter(Boolean).join(' ').toLowerCase()
})));
function jumpTo(hit) {
  xmb.setCat(hit.ci, true);
  xmb.setItem(hit.ii);
  closeDrops();
  searchInput.value = '';
  searchResults.replaceChildren();
}
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.replaceChildren();
  if (q.length < 2) return;
  const hits = searchIndex.filter(en => en.hay.includes(q)).slice(0, 8);
  if (!hits.length) {
    const none = document.createElement('span');
    none.className = 'none';
    none.textContent = 'nothing found';
    searchResults.appendChild(none);
    return;
  }
  hits.forEach(h => {
    const b = document.createElement('button');
    b.className = 'hit';
    const t = document.createElement('span');
    t.textContent = h.title;
    const c = document.createElement('i');
    c.textContent = h.cat;
    b.append(t, c);
    b.addEventListener('click', () => jumpTo(h));
    searchResults.appendChild(b);
  });
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const first = searchResults.querySelector('.hit');
    if (first) first.click();
  } else if (e.key === 'Escape') {
    closeDrops();
  }
});

/* ---------- dark / light ----------
   Royal blue flips its palette; the lava lamp has its own mode button
   (we press it), the beach has a Time knob (night for dark, day for
   light). The choice persists. */
const modeBtn = document.getElementById('modeBtn');
const sunI = document.getElementById('modeSun');
const moonI = document.getElementById('modeMoon');
function syncFrameMode(light) {
  const f = document.querySelector('.themeframe');
  if (!f) return;
  /* space swaps its whole face: stars for dark, the murmuration for light */
  const src = f.getAttribute('src') || '';
  if (src.includes('space') || src.includes('birds')) {
    const want = light ? 'themes/birds.html' : 'themes/space.html';
    if (src !== want) f.src = want;
    return;
  }
  try {
    const d = f.contentDocument;
    if (!d) return;
    const lavaMode = d.getElementById('mode');
    if (lavaMode) {
      if (d.documentElement.classList.contains('light') !== light) lavaMode.click();
      return;
    }
    const sun = d.getElementById('sun');
    if (sun) {
      sun.value = light ? '0.5' : '0.06';
      sun.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch { /* frame not ready yet */ }
}
function applyMode(light) {
  document.body.classList.toggle('light', light);
  sunI.style.display = light ? 'none' : 'block';
  moonI.style.display = light ? 'block' : 'none';
  modeBtn.setAttribute('aria-label', light ? 'Dark mode' : 'Light mode');
  syncFrameMode(light);
  try { localStorage.setItem('xmb-mode', light ? 'light' : 'dark'); } catch {}
}
modeBtn.addEventListener('click', () =>
  applyMode(!document.body.classList.contains('light')));
let storedMode = 'dark';
try { storedMode = localStorage.getItem('xmb-mode') || 'dark'; } catch {}
if (storedMode === 'light') applyMode(true);

/* ---------- translate ----------
   No widget, no cookie, NO RELOAD: our own translator. Every text node
   on screen keeps its English snapshot, gets translated through the
   public endpoint, cached forever in localStorage, and FADES to the
   new language in place. New renders are translated as they appear. */
const langMenu = document.getElementById('langMenu');
let curLang = '';
try { curLang = localStorage.getItem('xmb-lang') || ''; } catch {}

/* BAKED dictionaries: locales/<lang>.json is written at deploy time by
   tools/bake-i18n.mjs. Switching language = one file load + one
   synchronous pass over the page. No per-string requests, no async
   races, no mixed languages, ever. Unknown strings stay English. */
const dicts = {};
const reverses = {};
async function loadDict(lang) {
  if (dicts[lang]) return dicts[lang];
  try {
    const res = await fetch('locales/' + lang + '.json');
    dicts[lang] = res.ok ? await res.json() : {};
  } catch { dicts[lang] = {}; }
  reverses[lang] = {};
  for (const [en, tr] of Object.entries(dicts[lang])) reverses[lang][tr] = en;
  return dicts[lang];
}
/* a node's English snapshot must BE English: if the text matches a
   known translation, map it back first (heals any poisoned state) */
function toEnglish(text) {
  const t = text.trim();
  for (const lang in reverses) {
    const en = reverses[lang][t];
    if (en) return en;
  }
  return null;
}

/* the song title, times and clock stay as they are */
const XL_SKIP = '.pill, #clock, script, style, svg, input, textarea';
function xlNodes() {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = n.nodeValue;
      if (!t || t.trim().length < 2) return NodeFilter.FILTER_REJECT;
      if (!/[a-zA-Z]{2}/.test(t)) return NodeFilter.FILTER_REJECT;
      const el = n.parentElement;
      if (!el || el.closest(XL_SKIP)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let n;
  while ((n = walker.nextNode())) out.push(n);
  return out;
}

let xlRun = 0;
async function applyLang() {
  const run = ++xlRun;
  const nodes = xlNodes();
  nodes.forEach(n => {
    if (n.__en !== undefined) return;
    const healed = toEnglish(n.nodeValue);
    n.__en = healed !== null ? healed : n.nodeValue;
  });
  /* the text changes IMMEDIATELY (correctness first), the fade-in is
     decoration: no delayed writes, nothing to cancel, no races */
  const swap = (n, text) => {
    if (n.nodeValue === text) return;
    n.nodeValue = text;
    const el = n.parentElement;
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .3s ease';
      el.style.opacity = '';
    });
  };
  if (!curLang) {
    nodes.forEach(n => swap(n, n.__en));
    return;
  }
  const dict = await loadDict(curLang);
  if (run !== xlRun) return;
  nodes.forEach(n => {
    const t = dict[n.__en.trim()];
    if (!t) { swap(n, n.__en); return; }
    const pre = n.__en.match(/^\s*/)[0];
    const post = n.__en.match(/\s*$/)[0];
    swap(n, pre + t + post);
  });
}

langMenu.addEventListener('click', e => {
  const b = e.target.closest('button[data-lang]');
  if (!b) return;
  curLang = b.dataset.lang;
  try { localStorage.setItem('xmb-lang', curLang); } catch {}
  langMenu.querySelectorAll('button[data-lang]').forEach(x =>
    x.setAttribute('aria-current', String(x.dataset.lang === curLang)));
  closeDrops();
  applyLang();
});
langMenu.querySelectorAll('button[data-lang]').forEach(b =>
  b.setAttribute('aria-current', String(b.dataset.lang === curLang)));

/* whatever a render just produced gets translated too (text swaps are
   characterData changes, so this never observes itself) */
const xlObserver = new MutationObserver(muts => {
  if (!curLang) return;
  /* our own ticking widgets (player time, clock) churn the DOM every
     second; they are excluded from translation anyway, so ignore them */
  const relevant = muts.some(m => {
    const el = m.target instanceof Element ? m.target : m.target.parentElement;
    return el && !el.closest('.pill, #clock');
  });
  if (!relevant) return;
  clearTimeout(xlObserver.__t);
  xlObserver.__t = setTimeout(applyLang, 350);
});
xlObserver.observe(document.body, { childList: true, subtree: true });
if (curLang) setTimeout(applyLang, 900);

/* the lava lamp is the house default; visitors can change it */
let storedTheme = 'lava';
try { storedTheme = localStorage.getItem('xmb-theme') || 'lava'; } catch {}
applyTheme(storedTheme);

/* The clock is pure console theatre, but it is the detail that sells it. */
const clock = document.getElementById('clock');
function tick() {
  const now = new Date();
  const day = now.toLocaleDateString('en-GB', { weekday: 'short' });
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  clock.textContent = day + ' ' + date + '  ·  ' + time;
}
tick();
setInterval(tick, 10_000);
