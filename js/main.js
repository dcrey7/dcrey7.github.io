/* Boot order: home screen renders → boot gate → sound → clock. */

import { initHome } from './home.js';
import { initBoot } from './boot.js';
import { initSound } from './sound.js';

const home = initHome();
initBoot();
initSound(document.getElementById('sndBtn'));

/* Deep link: ?tab=play&i=1 opens the rail on a given tile. */
const q = new URLSearchParams(location.search);
if (q.has('tab')) home.setTab(q.get('tab') === 'play' ? 1 : 0);
if (q.has('i'))   home.setFocus(Number(q.get('i')) || 0, true);

/* The clock is pure console theatre, but it is the detail that sells it. */
const clock = document.getElementById('clock');
function tick() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}
tick();
setInterval(tick, 10_000);
