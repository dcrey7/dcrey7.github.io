/* Opt-in synth sound: short blips, no audio assets.
   The console plays a tick per tile and a sting per tab. */

import { bus } from './config.js';

let audio = null, on = false;

function beep(freqs, dur = 0.07, gain = 0.04) {
  if (!on) return;
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  const t = audio.currentTime;
  freqs.forEach((f, i) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(gain, t + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + dur);
    o.connect(g).connect(audio.destination);
    o.start(t + i * 0.05);
    o.stop(t + i * 0.05 + dur);
  });
}

export function initSound(btn) {
  btn.addEventListener('click', () => {
    on = !on;
    btn.setAttribute('aria-pressed', on);
    btn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    beep([660, 880]);
  });

  bus.addEventListener('focus', () => beep([720], 0.045, 0.03));
  bus.addEventListener('tab',   () => beep([392, 523], 0.08, 0.035));
  bus.addEventListener('start', () => beep([262, 392, 523], 0.18, 0.05));
}
