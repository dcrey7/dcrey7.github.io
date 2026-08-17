/* Boot order: cross media bar renders → boot gate → sound → clock. */

import { initXmb } from './xmb.js';
import { initBoot } from './boot.js';
import { initSound } from './sound.js';

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

/* The clock is pure console theatre, but it is the detail that sells it. */
const clock = document.getElementById('clock');
function tick() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}
tick();
setInterval(tick, 10_000);
