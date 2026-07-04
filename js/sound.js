/* Opt-in synth sound: square-wave blips, no audio assets. */
import { bus } from './config.js';

let audio = null, on = false;

function beep(freqs, dur = 0.09, gain = 0.05){
  if(!on) return;
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  const t = audio.currentTime;
  freqs.forEach((f, i) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(gain, t + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + dur);
    o.connect(g).connect(audio.destination);
    o.start(t + i * 0.06); o.stop(t + i * 0.06 + dur);
  });
}

export function initSound(btn){
  btn.addEventListener('click', () => {
    on = !on;
    btn.textContent = 'SOUND: ' + (on ? 'ON' : 'OFF');
    btn.setAttribute('aria-pressed', on);
    beep([523, 659, 784]);
  });
  bus.addEventListener('nav',   e => beep(e.detail.fwd ? [392, 523] : [523, 659]));
  bus.addEventListener('row',   () => beep([660], 0.05, 0.03));
  bus.addEventListener('start', () => beep([262, 392, 523], 0.22, 0.06));
}
