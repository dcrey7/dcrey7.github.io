/* Boot order: cross media bar renders → boot gate → sound → clock. */

import { initXmb } from './xmb.js';
import { initBoot } from './boot.js';
import { initSound } from './sound.js';
import { SPOTIFY } from './data.js';

const xmb = initXmb();
initBoot();
initSound(document.getElementById('sndBtn'));

/* Deep link: ?cat=play&i=1 opens a category on a given item. */
const q = new URLSearchParams(location.search);
if (q.has('cat')) {
  const names = ['about', 'work', 'education', 'play', 'people', 'trophies', 'contact'];
  const n = names.indexOf(q.get('cat'));
  if (n >= 0) xmb.setCat(n, true);
}
if (q.has('i')) xmb.setItem(Number(q.get('i')) || 0, true);

/* The ♫ player: a Spotify playlist embed dropping from the top right.
   The iframe is only mounted on first open, and the button only exists
   when a playlist is configured in data.js. */
const musBtn = document.getElementById('musBtn');
const musicEl = document.getElementById('music');
const playlistId = (SPOTIFY.match(/playlist\/([A-Za-z0-9]+)/) || [])[1];
if (playlistId) {
  musBtn.hidden = false;
  musBtn.addEventListener('click', () => {
    if (!musicEl.firstChild) {
      const f = document.createElement('iframe');
      f.src = `https://open.spotify.com/embed/playlist/${playlistId}?theme=0`;
      f.allow = 'encrypted-media; fullscreen';
      f.loading = 'lazy';
      f.title = 'Playlist';
      musicEl.appendChild(f);
    }
    const on = musicEl.classList.toggle('on');
    musBtn.setAttribute('aria-pressed', on);
  });
}

/* The clock is pure console theatre, but it is the detail that sells it. */
const clock = document.getElementById('clock');
function tick() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}
tick();
setInterval(tick, 10_000);
