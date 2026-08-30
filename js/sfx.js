/* Navigation sounds, cloned from the PS3 cross media bar.

   Nothing here is a recording: every sound is SYNTHESISED with the Web
   Audio API, from measurements of the console's own cursor and OK sounds
   (pitch, partials, envelope). Shipping Sony's files would be a copyright
   problem; a tone we generate ourselves is not.

   What the measurements said:
   - cursor: a pure tone at 6.84 kHz with a faint partial at 8.7 kHz, 46 ms
     long, instant attack, down to a quarter in 6 ms, a short hold, gone by
     36 ms, very quiet (peak 0.09). No noise, no click.
   - ok: a 3.13 kHz tone, 12 ms rise, held to 45 ms, gone by 75 ms, quieter
     still.

   The speaker button in the top bar mutes; the choice is remembered. The
   context is created on the first sound, after the PRESS ANY KEY gesture,
   so browsers allow it. */

let ctx = null;
let on = true;

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* one voice: a sine at `freq`, plus its partials, through one envelope.
   `env` is a list of [time in seconds, level] points, level relative to vol */
function voice(freq, partials, env, vol) {
  try {
    const c = audio();
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    env.forEach(([at, level]) => {
      g.gain.exponentialRampToValueAtTime(Math.max(level * vol, 0.0001), t + at);
    });
    g.connect(c.destination);
    const end = t + env[env.length - 1][0] + 0.01;
    [[freq, 1], ...partials].forEach(([f, amt]) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const og = c.createGain();
      og.gain.value = amt;
      osc.connect(og).connect(g);
      osc.start(t);
      osc.stop(end);
    });
  } catch { /* no audio on this device: silence is fine */ }
}

/* the cursor tick for the rows: the measured console sound */
const TICK_ENV = [[0.0005, 1], [0.006, 0.25], [0.020, 0.20], [0.036, 0.001]];
const tick = vol => voice(6840, [[8700, 0.15]], TICK_ENV, vol);

/* the deck tick for the categories: the same family, a fifth lower and a
   touch longer, so you hear which axis moved (the console uses one tick
   for both; the user wants two) */
const DECK_ENV = [[0.0005, 1], [0.008, 0.30], [0.028, 0.22], [0.048, 0.001]];
const deck = vol => voice(4560, [[5800, 0.15]], DECK_ENV, vol);

/* the OK sound: a soft rise, a short hold, a clean fade */
const OK_ENV = [[0.012, 1], [0.045, 0.8], [0.075, 0.001]];
const okay = vol => voice(3130, [], OK_ENV, vol);

export const sfx = {
  cat:    () => { if (on) deck(0.12); },
  item:   () => { if (on) tick(0.10); },
  select: () => { if (on) okay(0.07); },
  set(v) { on = !!v; },
  get on() { return on; }
};
