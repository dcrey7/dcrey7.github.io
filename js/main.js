/* Boot order: cross media bar renders → boot gate → player → clock. */

import { initXmb } from './xmb.js';
import { initBoot } from './boot.js';
import { SPOTIFY_PLAYLISTS } from './data.js';

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

/* ---------- the disc player ----------
   A custom pill: spinning playlist cover, title, progress bar, play/pause
   and prev/next cycling the playlists. Powered by Spotify's official
   iframe embed controller (hidden); covers and titles come from Spotify's
   public oEmbed endpoint. Spotify does not expose per-track names or track
   skipping to websites, so the playlist is the unit here. */
const pill = document.getElementById('pill');
const ids = SPOTIFY_PLAYLISTS
  .map(u => (u.match(/playlist\/([A-Za-z0-9]+)/) || [])[1])
  .filter(Boolean);
if (ids.length) {
  pill.hidden = false;
  const disc = document.getElementById('pillDisc');
  const title = document.getElementById('pillTitle');
  const prog = document.getElementById('pillProg');
  const timeEl = document.getElementById('pillTime');
  const btnPlay = document.getElementById('pillPlay');
  let ctrl = null, cur = 0, paused = true;
  const mmss = ms => {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const meta = async n => {
    try {
      const r = await fetch('https://open.spotify.com/oembed?url=' +
        encodeURIComponent('https://open.spotify.com/playlist/' + ids[n]));
      const j = await r.json();
      title.textContent = j.title || 'playlist';
      if (j.thumbnail_url) disc.src = j.thumbnail_url;
    } catch { title.textContent = 'playlist'; }
  };
  meta(0);

  const apiScript = document.createElement('script');
  apiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
  apiScript.async = true;
  document.head.appendChild(apiScript);
  window.onSpotifyIframeApiReady = API => {
    API.createController(document.getElementById('spotify-host'),
      { uri: 'spotify:playlist:' + ids[0], width: 320, height: 152 },
      c => {
        ctrl = c;
        c.addListener('playback_update', e => {
          paused = e.data.isPaused;
          btnPlay.textContent = paused ? '▶' : '⏸';
          disc.classList.toggle('spin', !paused);
          if (e.data.duration) {
            prog.style.width = (e.data.position / e.data.duration * 100) + '%';
            timeEl.textContent = `${mmss(e.data.position)} / ${mmss(e.data.duration)}`;
          }
        });
      });
  };

  const load = n => {
    cur = ((n % ids.length) + ids.length) % ids.length;
    meta(cur);
    if (ctrl) { ctrl.loadUri('spotify:playlist:' + ids[cur]); ctrl.play(); }
  };
  btnPlay.addEventListener('click', () => {
    if (!ctrl) return;
    ctrl.togglePlay();
    /* react instantly; the playback_update event confirms a beat later */
    disc.classList.toggle('spin', paused);
    btnPlay.textContent = paused ? '⏸' : '▶';
  });
  document.getElementById('pillPrev').addEventListener('click', () => load(cur - 1));
  document.getElementById('pillNext').addEventListener('click', () => load(cur + 1));
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
