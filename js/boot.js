/* Boot gate: a short load bar, then PRESS START. Console splash, nothing more. */

import { emit, REDUCED } from './config.js';

export function initBoot() {
  const bar   = document.getElementById('bar-fill');
  const start = document.getElementById('start');
  const boot  = document.getElementById('boot');
  let ready = false, done = false, pct = 0;

  const timer = setInterval(() => {
    pct = Math.min(100, pct + 3 + Math.random() * 5);
    bar.style.width = pct + '%';
    if (pct >= 100) arm();
  }, REDUCED ? 20 : 55);

  /* ?skip lands straight on the home screen — used for deep links and shots. */
  if (new URLSearchParams(location.search).has('skip')) {
    queueMicrotask(() => { arm(); enter(); });
  }

  function arm() {
    if (ready) return;
    ready = true;
    clearInterval(timer);
    bar.style.width = '100%';
    start.classList.add('ready');
  }

  function enter() {
    if (done) return;
    if (!ready) { arm(); return; }
    done = true;
    document.body.classList.remove('booting');
    emit('start');
    setTimeout(() => boot.remove(), 600);
  }

  start.addEventListener('click', enter);
  boot.addEventListener('click', enter);
  /* PRESS ANY KEY means any key */
  addEventListener('keydown', e => {
    if (done) return;
    e.preventDefault();
    enter();
  });

  return { enter };
}
