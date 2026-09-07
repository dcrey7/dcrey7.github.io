/* Drive the motion playground from the site, through its own controls.
 *
 * The playground already solves the hard parts: the retarget, the desk and
 * chair placement, the typing reach, the bowl and the bottle. So this file
 * never touches the scene. It presses the same buttons a person would, then
 * walks the camera slowly between framings so the panel is never a still.
 */

const el = (id) => document.getElementById(id);

/* One motion per screen. Each is a button rather than a clip name, because
   the button also brings the prop with it. */
const ACTS = {
  about: { button: 'eat', settled: /noodle/i, view: 'stand' },
  building: { button: 'computer', settled: /computer/i, view: 'desk' },
  extras: { button: 'drink', settled: /drink/i, view: 'stand' }
};

/* Where the camera may go, per kind of shot.
 *
 * target   metres from his feet: the point the camera looks at.
 * dist     how far the camera sits, in metres.
 * el, az   elevation and compass angle, in degrees. Azimuth stays in front of
 *          him: swing past this and you film his back.
 * near/far the hand zoom limits. This lens shows 0.767 * distance metres of
 *          height, so 2.0 m frames about three quarters of a 2 m body, and
 *          3.8 m still holds the whole motion inside the frame.
 */
const VIEWS = {
  stand: {
    /* Aim high on the body. At the closest framing something must leave the
       frame, and it should be his shins, never the top of his head. */
    target: [0.15, 1.30, 0], dist: [2.2, 3.6],
    el: [-2, 18], az: [10, 92], near: 2.0, far: 3.8
  },
  desk: {
    target: [0.32, 0.80, 0], dist: [2.8, 4.3],
    el: [4, 26], az: [10, 78], near: 2.5, far: 4.8
  }
};

const HOLD = 5200;        // how long a framing is held before the next move
const MOVE = 3000;        // how long the move itself takes
const AFTER_TOUCH = 6000; // how long to leave the camera alone after a drag

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rad = (deg) => (deg * Math.PI) / 180;
const mix = (a, b, k) => a + (b - a) * k;
const between = ([lo, hi]) => lo + Math.random() * (hi - lo);
/* Slow at both ends, quick in the middle. A linear move reads mechanical. */
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

async function until(test, timeout = 60000) {
  const stop = Date.now() + timeout;
  while (Date.now() < stop) {
    if (test()) return true;
    await wait(120);
  }
  return false;
}

/* ---------- the camera ---------- */

let view = null;
let hold = 0;
let move = null;
let quiet = 0;

const api = () => window.avatarView;

/* A framing is an angle, a distance, and the point being looked at. The
   look-at point has to travel with the rest of it. Reading the angle against
   where the camera is aimed now, and then snapping the aim to a fixed spot on
   the first frame of a move, is what made the picture jump before it glided:
   after a zoom the two aims can sit 10 to 15 cm apart. */

/** Read the framing the camera is in right now. */
function pose() {
  const { camera, controls } = api();
  const t = controls.target;
  const x = camera.position.x - t.x;
  const y = camera.position.y - t.y;
  const z = camera.position.z - t.z;
  const d = Math.hypot(x, y, z) || 1;
  return {
    d,
    az: (Math.atan2(x, z) * 180) / Math.PI,
    el: (Math.asin(y / d) * 180) / Math.PI,
    tx: t.x, ty: t.y, tz: t.z
  };
}

/** The point this kind of shot looks at, in world space. */
function aim() {
  const { actor } = api();
  const [tx, ty, tz] = view.target;
  return {
    tx: actor.position.x + tx,
    ty: actor.position.y + ty,
    tz: actor.position.z + tz
  };
}

function put(p) {
  const { camera, controls } = api();
  const flat = Math.cos(rad(p.el)) * p.d;
  controls.target.set(p.tx, p.ty, p.tz);
  camera.position.set(
    p.tx + flat * Math.sin(rad(p.az)),
    p.ty + Math.sin(rad(p.el)) * p.d,
    p.tz + flat * Math.cos(rad(p.az))
  );
  controls.update();
}

/** The short way round from one bearing to another, in degrees.
 *  Bearings come back from atan2 inside -180 to 180, so a turn from -170 to
 *  80 is 110 degrees one way and 250 the other. Straight interpolation takes
 *  the long way and swings the camera right around him. */
function arc(from, to) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/** Choose the next framing. Make it a real change, not a nudge. */
function next(from) {
  const at = aim();
  for (let tries = 0; tries < 24; tries++) {
    const p = { d: between(view.dist), az: between(view.az), el: between(view.el), ...at };
    if (Math.abs(arc(from.az, p.az)) > 22 || Math.abs(p.d - from.d) > 0.55) return p;
  }
  return { d: between(view.dist), az: between(view.az), el: between(view.el), ...at };
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!view || !api()) return;

  // Hands off while someone is dragging or zooming, and for a while after.
  if (now < quiet) {
    move = null;
    // Pick up again shortly after they let go, not a further five seconds on.
    hold = now + 1200;
    return;
  }
  if (move) {
    const p = Math.min(1, (now - move.at) / MOVE);
    const k = ease(p);
    const { from, to } = move;
    put({
      d: mix(from.d, to.d, k),
      az: from.az + arc(from.az, to.az) * k,
      el: mix(from.el, to.el, k),
      tx: mix(from.tx, to.tx, k),
      ty: mix(from.ty, to.ty, k),
      tz: mix(from.tz, to.tz, k)
    });
    if (p >= 1) {
      move = null;
      hold = now + HOLD;
    }
    return;
  }
  if (now >= hold) {
    const from = pose();
    move = { at: now, from, to: next(from) };
  }
}

function watchHands() {
  const { controls } = api();
  const pause = () => { quiet = performance.now() + AFTER_TOUCH; };
  controls.addEventListener('start', pause);
  controls.addEventListener('end', pause);
  document.querySelector('canvas').addEventListener('wheel', pause, { passive: true });
}

/* ---------- the screens ---------- */

let run = 0;

async function perform(name) {
  const act = ACTS[name] || ACTS.about;
  const mine = ++run;

  // Every one of these motions carries a prop, and the button refuses to run
  // until the prop list has arrived. It loads separately from the model.
  await until(() => el('prop').options.length > 1, 30000);
  if (mine !== run) return;

  el(act.button)?.click();
  // The button loads a clip and a prop, and parks the camera itself. Wait for
  // it to land before taking the camera over, or the first move fights it.
  await until(() => act.settled.test(el('current').textContent), 30000);
  if (mine !== run) return;
  await wait(500);
  if (mine !== run) return;

  view = VIEWS[act.view];
  const { controls } = api();
  controls.minDistance = view.near;
  controls.maxDistance = view.far;
  // Open on the framing the viewer chose, then drift away from it.
  hold = performance.now() + 1400;
  move = null;
  guard(act, mine);
}

/* Put the motion back if the viewer drops it.
 *
 * When a clip reaches its last frame the viewer's own loop falls back to a
 * standing idle. The drink cycle is eight seconds long and trips that on
 * every lap, so the screen would quietly turn into a man standing still.
 * Press the button again and hold the camera where it was, so the recovery
 * does not read as a jump cut. */
function guard(act, mine) {
  const beat = setInterval(() => {
    if (mine !== run) return clearInterval(beat);
    if (act.settled.test(el('current').textContent)) return;
    const where = pose();
    el(act.button)?.click();
    setTimeout(() => { if (mine === run && view) put(where); }, 260);
  }, 1500);
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
  if (!ok || !api()) {
    shade.textContent = 'COULD NOT LOAD';
    return;
  }
  shade.classList.add('gone');
  // Take it out of the layout once it has faded, so it can never sit over him.
  setTimeout(() => { shade.hidden = true; }, 600);
  started = true;
  watchHands();
  requestAnimationFrame(frame);
  perform(wanted);
  parent.postMessage({ avatarReady: true }, '*');
}

main();
