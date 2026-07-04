/* Boot order: deck (renders content) → boot gate → backdrop (fluid, else
   clouds, else CSS gradient) → sound → coin. */
import { REDUCED, MOBILE } from './config.js';
import { initDeck } from './deck.js';
import { initBoot } from './boot.js';
import { initFluid } from './fluid.js';
import { initClouds } from './clouds.js';
import { initSound } from './sound.js';
import { initCoin } from './coin.js';

const deckApi = initDeck();
initBoot(() => deckApi.go(1));
initSound(document.getElementById('sndBtn'));

/* backdrop */
const canvas = document.getElementById('gl');
function sizeCanvas(){
  const m = MOBILE();
  const dpr = Math.min(devicePixelRatio || 1, m ? 1 : 1.5);
  canvas.width = innerWidth * dpr * (m ? 0.7 : 0.8);
  canvas.height = innerHeight * dpr * (m ? 0.7 : 0.8);
}
sizeCanvas();
addEventListener('resize', sizeCanvas);

const gl2 = canvas.getContext('webgl2', { antialias: false, alpha: false });
let running = false;
if(gl2 && !REDUCED) running = initFluid(canvas, gl2);
if(!running){
  const gl = gl2 || canvas.getContext('webgl', { antialias: false, alpha: false });
  if(gl) running = initClouds(canvas, gl);
}
if(!running){
  canvas.style.display = 'none';
  document.body.classList.add('nogl');
}

initCoin().catch(err => console.warn('coin disabled:', err));
