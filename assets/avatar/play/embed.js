/* Drive the motion playground from the site, through its own controls.
 *
 * The playground already solves the hard parts: the retarget, the desk and
 * chair placement, the typing reach, the bowl and the bottle. So this file
 * never touches the scene. It presses the same buttons a person would.
 */

const el = (id) => document.getElementById(id);

// The clip ids in the trimmed manifest. Named clips are played through the
// motion list; the rest have their own button because the button also brings
// the props with it.
const CLIP = {
  dance: '02fe8676-0001f740-PED_Dance_Loop_Male_01',
  run: '0438e7da-000c6e30-THG_LOC_Run_CYC1',
  kick: '1d5f33c7-00034c20-THG_ELITE_STR_Kick_High',
  roll: '94953daa-00023770-LOC_Jump_Land_Roll'
};

// One entry per about screen. hold is how long the shot stays before the
// next one, in milliseconds. The two loops get longer holds because they
// read well; the one-shot moves get short ones so he is never standing
// still for long.
const ACTS = {
  about: [
    { clip: 'dance', hold: 7000, zoom: 3 },
    { clip: 'run', hold: 5000, zoom: 3 },
    { clip: 'kick', hold: 3200, zoom: 3 },
    { clip: 'roll', hold: 3200, zoom: 2 }
  ],
  building: [{ button: 'computer', hold: 20000, zoom: 0 }],
  extras: [
    { button: 'eat', hold: 9000, zoom: 4 },
    { button: 'drink', hold: 11000, zoom: 4 }
  ]
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(test, timeout = 60000) {
  const stop = Date.now() + timeout;
  while (Date.now() < stop) {
    if (test()) return true;
    await wait(120);
  }
  return false;
}

/** Play one named clip through the motion list. */
function pick(id) {
  const category = el('category');
  // A button leaves the list filtered to its own category, so clear the
  // filter first or the clip we want is not in the list any more.
  if (category.value) {
    category.value = '';
    category.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const motion = el('motion');
  if (!Array.from(motion.options).some((o) => o.value === id)) return false;
  motion.value = id;
  motion.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function frame(steps) {
  el('camera-home')?.click();
  for (let i = 0; i < steps; i++) el('camera-in')?.click();
}

let run = 0;

async function perform(name) {
  const shots = ACTS[name] || ACTS.about;
  const mine = ++run;
  for (let i = 0; mine === run; i++) {
    const shot = shots[i % shots.length];
    if (shot.button) el(shot.button)?.click();
    else pick(CLIP[shot.clip]);
    // The button reframes the camera itself for the desk, so only reframe
    // when this shot asked for it.
    if (shot.zoom) {
      await wait(400);
      if (mine !== run) return;
      frame(shot.zoom);
    }
    await wait(shot.hold);
  }
}

let started = false;
let wanted = new URLSearchParams(location.search).get('act') || 'about';

// Listen from the first moment. The site can switch screens while the model
// is still loading, and that instruction must not be dropped.
addEventListener('message', (e) => {
  if (!e.data || !e.data.avatarAct) return;
  wanted = e.data.avatarAct;
  if (started) perform(wanted);
});

async function main() {
  // Wait for the model AND the motion list. Do not wait for the words "your
  // avatar is ready": the viewer selects a clip by itself the moment the list
  // arrives, which overwrites that label and the wait would never end.
  const ok = await until(
    () => el('motion').options.length > 0 && el('current').textContent.trim() !== ''
  );
  const shade = el('shade');
  if (!ok) {
    shade.textContent = 'COULD NOT LOAD';
    return;
  }
  shade.classList.add('gone');
  // Take it out of the layout once it has faded, so it can never sit over him.
  setTimeout(() => { shade.hidden = true; }, 600);
  started = true;
  perform(wanted);
  parent.postMessage({ avatarReady: true }, '*');
}

main();
