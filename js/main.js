/* Boot order: cross media bar renders → boot gate → player → clock. */

import { initXmb } from './xmb.js';
import { initBoot } from './boot.js';
import { bus } from './config.js';
import { YT_PLAYLISTS } from './data.js';

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
  const artist = document.getElementById('pillArtist');
  const prog = document.getElementById('pillProg');
  const timeEl = document.getElementById('pillTime');
  const btnPlay = document.getElementById('pillPlay');
  /* the OPENER is always the first song of the first playlist; after it,
     everything is random playlist + random song */
  let yt = null, curList = 0, lastId = null, lastHop = 0,
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
    /* never write blanks: mid-switch YouTube reports empty metadata for a
       beat, and clearing the lines made the block jump */
    if (d.title) title.textContent = d.title;
    if (d.author) artist.textContent = d.author;
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
    yt = new YT.Player('radio-host', {
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
    if (!yt) return;
    if (yt.getPlayerState && yt.getPlayerState() === 1) {
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

  /* AUTOPLAY: PRESS START is the user gesture browsers require — the radio
     opens with the FIRST song of the FIRST playlist, then goes random.
     Any first click or key works as fallback. */
  const tryPlay = () => { if (yt && yt.playVideo) yt.playVideo(); };
  bus.addEventListener('start', tryPlay);
  addEventListener('pointerdown', tryPlay, { once: true });
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
      timeEl.textContent = `${mmss(p)} / ${mmss(d)}`;
    }
    refresh();
  }, 800);
}

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
