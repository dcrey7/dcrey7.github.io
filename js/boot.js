/* Boot gate: a short load bar, then PRESS START. Console splash, nothing more. */

import { emit, REDUCED } from './config.js';
import { spin, setSpeed, setEnv } from './icon3d.js';
import { chromeMark } from './chrome3d.js';
import { AFAICON_PATH } from './afaicon-path.js';

export function initBoot() {
  const bar   = document.getElementById('bar-fill');
  const start = document.getElementById('start');
  const boot  = document.getElementById('boot');
  const coin  = document.getElementById('coin');
  let ready = false, done = false, pct = 0;

  /* the afaicon in CHROME, turning on Y. The frames are path traced in
     Blender (extrude, bevel, metal, an HDRI studio) and packed into one
     sheet, assets/afaicon-chrome.webp; the page only blits them. If the
     sheet is missing, the canvas extrusion with the painted chrome
     environment stands in. */
  /* live WebGL chrome (smooth at any frame rate); without WebGL, the
     canvas extrusion with the painted chrome environment stands in */
  let mark = null;
  const canvasFallback = () => {
    coin.dataset.d = AFAICON_PATH;
    const envImg = new Image();
    envImg.onload = () => setEnv(envImg);
    envImg.src = 'assets/env-chrome.webp';
    spin(coin, { group: 'boot', fit: .92, material: 'chrome' });
  };
  if (coin && !REDUCED) {
    chromeMark(coin, AFAICON_PATH, 'assets/env-studio.webp')
      .then(m => { mark = m; })
      .catch(err => { console.warn('webgl chrome unavailable:', err); canvasFallback(); });
  }

  const timer = setInterval(() => {
    pct = Math.min(100, pct + 3 + Math.random() * 5);
    bar.style.width = pct + '%';
    if (pct >= 100) arm();
  }, REDUCED ? 20 : 55);

  /* ?skip lands straight on the home screen — used for deep links and shots. */
  if (new URLSearchParams(location.search).has('skip')) {
    queueMicrotask(() => { arm(); enter(true); });
  }

  function arm() {
    if (ready) return;
    ready = true;
    clearInterval(timer);
    bar.style.width = '100%';
    start.classList.add('ready');
  }

  /* the press: the coin spins up and everything on the gate fades, then
     the home screen fades in underneath. `fast` skips the show. */
  function enter(fast) {
    if (done) return;
    if (!ready) { arm(); return; }
    done = true;
    emit('start');   /* the theme song starts here, on the gesture */
    if (fast || REDUCED) {
      document.body.classList.remove('booting');
      setTimeout(() => boot.remove(), 600);
      return;
    }
    boot.classList.add('leaving');
    if (mark) mark.setSpeed(7);   /* the press spins it up, then it fades */
    setSpeed(7, 'boot');
    setTimeout(() => document.body.classList.remove('booting'), 420);
    setTimeout(() => boot.remove(), 1100);
  }

  start.addEventListener('click', () => enter());
  boot.addEventListener('click', () => enter());
  /* PRESS ANY KEY means any key */
  addEventListener('keydown', e => {
    if (done) return;
    e.preventDefault();
    enter();
  });

  return { enter };
}
