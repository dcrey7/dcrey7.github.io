/* The theme song: the site's opening music.

   It starts as early as the browser allows: at load when the browser
   permits it, otherwise on the first key or click (on the gate that is
   PRESS ANY KEY). It loops for ever at 20%, pauses while the radio in the pill plays, and the speaker button
   mutes it.

   Web Audio, not an <audio> tag: an AudioBufferSourceNode loops sample
   accurately between loopStart and loopEnd, so the intro plays once and
   the loop has no gap (an <audio loop> always hiccups at the join). The
   file itself ends in a crossfade into the bar before loopStart, made
   offline, so the jump is inaudible. The drop is a ramp on a gain node. */

let ctx = null, gain = null, buffer = null, src = null;
let loopStart = 0, loopEnd = 0;
let startedAt = 0, offset = 0;
let playing = false;     /* a source is running                 */
let wanted = false;      /* the site wants music                */
let held = false;        /* the radio is playing: stay quiet    */
let muted = false;
let level = 0.2;     /* 20% everywhere, the maximum (user rule) */
const DUCK = 0.2;        /* the same 20% after the press */
const listeners = new Set();
const notify = () => listeners.forEach(f => f());

function context() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    gain = ctx.createGain();
    gain.connect(ctx.destination);
    ctx.onstatechange = notify;
  }
  return ctx;
}

/* volume moves are always smooth: a mute takes 0.4 s, the dip at enter
   glides down over 2.5 s */
function applyGain(secs = 0.4) {
  const c = context();
  const g = gain.gain;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(g.value, c.currentTime);
  g.linearRampToValueAtTime(muted ? 0 : level, c.currentTime + secs);
}

function startSource(from) {
  const c = context();
  src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.loopStart = loopStart;
  src.loopEnd = loopEnd;
  src.connect(gain);
  src.start(0, from);
  startedAt = c.currentTime - from;
}

function position() {
  if (!playing) return offset;
  let p = context().currentTime - startedAt;
  if (p > loopEnd) p = loopStart + ((p - loopStart) % (loopEnd - loopStart));
  return p;
}

/* start or stop the source to match what is wanted */
function sync() {
  const should = wanted && !held && !!buffer;
  if (should && !playing) {
    const c = context();
    if (c.state === 'suspended') c.resume().catch(() => {});
    startSource(offset);
    playing = true;
    notify();
  } else if (!should && playing) {
    offset = position();
    try { src.stop(); } catch { /* already stopped */ }
    src = null;
    playing = false;
    notify();
  }
}

async function load(url) {
  const c = context();
  const res = await fetch(url);
  buffer = await c.decodeAudioData(await res.arrayBuffer());
  if (!loopEnd || loopEnd > buffer.duration) loopEnd = buffer.duration;
  sync();
}

/* the gesture that unlocks audio when the browser blocked it at load */
function unlock() {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}
addEventListener('keydown', unlock);
addEventListener('pointerdown', unlock);

export function initTheme({ url, loopStart: a, loopEnd: b }) {
  loopStart = a || 0;
  loopEnd = b || 0;
  wanted = true;
  load(url).catch(() => { /* no file: no theme, nothing else changes */ });
}

export function hold(on) { held = !!on; sync(); }
export function duck(on) { level = on ? DUCK : 1; if (ctx) applyGain(3); }
export function mute(on) { muted = !!on; if (ctx) applyGain(); }
export const onChange = f => listeners.add(f);
export const state = () => ({
  playing: playing && !!ctx && ctx.state === 'running',
  ready: !!buffer, position: position(),
  duration: buffer ? buffer.duration : 0
});
