/* Boot sequence: fake progress, rotating tips, PRESS START gate. */
import { emit } from './config.js';

const TIPS = [
  'TIP: SCROLL, SWIPE OR USE ↑↓ TO MOVE BETWEEN SCREENS',
  'TIP: ←→ BROWSES CARDS INSIDE A SCREEN',
  'TIP: TURN SOUND ON (TOP RIGHT) FOR THE FULL EXPERIENCE',
  'TIP: THE INK FOLLOWS YOUR CURSOR. GO ON, STIR IT.',
  'LOADING PARIS… LOADING GPUs… LOADING FOOTBALL…'
];

export function initBoot(goNext){
  const bar = document.getElementById('bar');
  const tipEl = document.getElementById('tip');
  const startEl = document.getElementById('start');
  const s0 = document.getElementById('s0');
  let booted = false, tipI = 0, pct = 0;

  const tipTimer = setInterval(() => {
    tipI = (tipI + 1) % TIPS.length;
    tipEl.textContent = TIPS[tipI];
  }, 1800);
  const progTimer = setInterval(() => {
    pct = Math.min(100, pct + 2.4 + Math.random() * 3);
    bar.style.width = pct + '%';
    if(pct >= 100) finish(false);
  }, 60);

  function finish(silent){
    if(booted) return;
    booted = true;
    clearInterval(progTimer); clearInterval(tipTimer);
    bar.style.width = '100%';
    startEl.classList.add('ready');
    if(!silent) emit('start');
  }

  startEl.addEventListener('click', () => goNext());
  s0.addEventListener('click', () => { booted ? goNext() : finish(false); });
  addEventListener('keydown', e => {
    if(e.key === 'Enter' && !booted) finish(false);
  });

  return { isBooted: () => booted, forceBoot: () => finish(true) };
}
