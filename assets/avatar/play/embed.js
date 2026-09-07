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
 * el, az  elevation and compass angle, in degrees. Azimuth stays in front of
 *         him: swing past this and you film his back.
 * room    how much further back than the closest fitting distance the camera
 *         may drift. 1.0 is everything just touching the edges of the frame,
 *         1.25 leaves a quarter again of air around it.
 *
 * There is no distance in metres here and no point to look at. Both are
 * worked out from where his body and his props actually are, every frame,
 * because that is the only way to promise nothing is ever cut off.
 */
const VIEWS = {
  stand: { el: [-2, 16], az: [10, 92], room: [1.0, 1.12] },
  desk: { el: [4, 24], az: [10, 78], room: [1.0, 1.14] }
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

/* A framing is a bearing, a height, and how much air to leave. The distance
   and the point to look at are not chosen: they are measured, every frame,
   from where his body and his props actually are. That is the only way to
   promise nothing is ever cut off, at any angle, in any pose. Pinning the top
   of his head was not enough, because a raised arm, a bowl or the desk can
   all reach outside a frame his head fits inside. */

/** Read the bearing and height the camera is at right now. */
function pose() {
  const { camera, controls } = api();
  const t = controls.target;
  const x = camera.position.x - t.x;
  const y = camera.position.y - t.y;
  const z = camera.position.z - t.z;
  const d = Math.hypot(x, y, z) || 1;
  const az = (Math.atan2(x, z) * 180) / Math.PI;
  const el = (Math.asin(y / d) * 180) / Math.PI;
  // Read the air it is actually holding, not a fresh random one. Taking over
  // with a random distance is what made the picture jump on arriving at a
  // screen: the viewer parks the camera at its own distance and the first
  // frame of ours threw it somewhere else.
  const box = measure();
  const need = box ? fit(box, az, el) : 0;
  const room = need > 0.001 ? Math.min(Math.max(d / need, 0.6), 3) : between(view.room);
  return { az, el, room };
}

const PAD = 0.02;      // a whisker, so a vertex right on the edge still fits
const SAMPLES = 900;   // vertices to test per frame, spread over the whole body
let vec;               // a scratch vector, borrowed from the scene's own class
let skins = null;      // the skinned meshes, and the stride to walk them at

/** The box that holds everything on screen, in world space.
 *
 *  Taken from the actual posed skin. Bones alone are not enough: loose
 *  trousers, shoulders, hair and a bowl held out at arm's length all reach
 *  well past the bone inside them, so a box drawn round the skeleton lets the
 *  edges of him cross the edge of the picture. A skinned mesh cannot be asked
 *  for its bounding box either, because it keeps the one from the pose it was
 *  built in and never follows the animation. So the vertices are read where
 *  they actually are, a fixed number of them spread over the whole body,
 *  which is cheap and close. Rigid things keep their real corners. */
function bounds() {
  const { actor } = api();
  if (!vec) vec = actor.position.clone();
  if (!skins || !skins.length) {
    skins = [];
    let total = 0;
    actor.traverse(o => { if (o.isSkinnedMesh) total += o.geometry.attributes.position.count; });
    actor.traverse(o => {
      if (!o.isSkinnedMesh) return;
      const n = o.geometry.attributes.position.count;
      skins.push({ mesh: o, count: n, step: Math.max(1, Math.round(total / SAMPLES)) });
    });
  }
  let lo = [Infinity, Infinity, Infinity];
  let hi = [-Infinity, -Infinity, -Infinity];
  const eat = () => {
    lo = [Math.min(lo[0], vec.x - PAD), Math.min(lo[1], vec.y - PAD), Math.min(lo[2], vec.z - PAD)];
    hi = [Math.max(hi[0], vec.x + PAD), Math.max(hi[1], vec.y + PAD), Math.max(hi[2], vec.z + PAD)];
  };
  for (const s of skins) {
    s.mesh.skeleton.update();
    for (let i = 0; i < s.count; i += s.step) {
      s.mesh.getVertexPosition(i, vec);
      vec.applyMatrix4(s.mesh.matrixWorld);
      eat();
    }
  }
  actor.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh) return;
    const g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    for (const x of [b.min.x, b.max.x]) {
      for (const y of [b.min.y, b.max.y]) {
        for (const z of [b.min.z, b.max.z]) {
          vec.set(x, y, z).applyMatrix4(o.matrixWorld);
          eat();
        }
      }
    }
  });
  if (!Number.isFinite(lo[0])) return null;
  return {
    cx: (lo[0] + hi[0]) / 2, cy: (lo[1] + hi[1]) / 2, cz: (lo[2] + hi[2]) / 2,
    hx: (hi[0] - lo[0]) / 2, hy: (hi[1] - lo[1]) / 2, hz: (hi[2] - lo[2]) / 2
  };
}

/* The box measured this frame, smoothed. It grows the instant he reaches out
   and shrinks slowly, so a shot never crops him mid movement and the camera
   never breathes in and out with his chewing. */
let shot = null;

function measure() {
  const b = bounds();
  if (!b) return shot;
  if (!shot) { shot = b; return shot; }
  // Grow at once, shrink over about a second. Any slower and the frame
  // stays wide long after he lowers his arm, and he looks small for it.
  const hold = (was, now) => (now > was ? now : was + (now - was) * 0.03);
  shot = {
    cx: shot.cx + (b.cx - shot.cx) * 0.05,
    cy: shot.cy + (b.cy - shot.cy) * 0.05,
    cz: shot.cz + (b.cz - shot.cz) * 0.05,
    hx: hold(shot.hx, b.hx),
    hy: hold(shot.hy, b.hy),
    hz: hold(shot.hz, b.hz)
  };
  return shot;
}

/** How far back the camera must sit for the whole box to fit the frame.
 *
 *  Worked out corner by corner. Taking the box's widest reach upward and its
 *  nearest face and adding them assumes the highest point is also the closest
 *  one, which for a person it is not: his head sits in the middle of his
 *  depth. That pushed the camera about a tenth further back than it needed to
 *  be and left him small in the frame. Each corner is asked for itself
 *  instead, and the one that needs the most room wins. */
function fit(box, az, el) {
  const canvas = document.querySelector('canvas');
  const aspect = Math.max(canvas.clientWidth / canvas.clientHeight, 0.2);
  const a = rad(az), e = rad(el);
  // The camera's own axes, from the bearing and the height it sits at.
  const right = { x: Math.cos(a), y: 0, z: -Math.sin(a) };
  const up = { x: -Math.sin(e) * Math.sin(a), y: Math.cos(e), z: -Math.sin(e) * Math.cos(a) };
  const back = { x: Math.sin(a) * Math.cos(e), y: Math.sin(e), z: Math.cos(a) * Math.cos(e) };
  const dot = (c, v) => c[0] * v.x + c[1] * v.y + c[2] * v.z;
  const tanUp = Math.tan(rad(21));            // half of the 42 degree lens
  const tanSide = tanUp * aspect;
  let need = 0;
  for (const sx of [-box.hx, box.hx]) {
    for (const sy of [-box.hy, box.hy]) {
      for (const sz of [-box.hz, box.hz]) {
        const c = [sx, sy, sz];
        const depth = dot(c, back);   // how much nearer this corner sits
        need = Math.max(need,
          Math.abs(dot(c, up)) / tanUp + depth,
          Math.abs(dot(c, right)) / tanSide + depth);
      }
    }
  }
  return need;
}

/* Where the camera was pointed when we took over, minus where we want it.
   It is walked to nothing over a second or so, so picking up after a drag or
   a zoom eases in instead of snapping. */
let bias = { x: 0, y: 0, z: 0 };

/* The distance actually used, eased. The box grows the instant the desk or a
   prop appears, which is right, because a frame that lags there would clip
   the new thing. But applying that to the camera in one frame is the jump
   seen when moving between screens. So the camera walks to the new distance:
   quickly outward, where the risk is clipping, slowly inward, where the only
   risk is looking restless. */
let reach = 0;

function put(p) {
  const { camera, controls } = api();
  const box = measure();
  if (!box) return;
  const want = fit(box, p.az, p.el) * p.room;
  if (!reach) reach = want;
  // Walk, and never faster than this. A share of the gap alone still lurches
  // when the gap is large, which is exactly what a desk appearing does to it.
  const gap = want - reach;
  const speed = gap > 0 ? 0.25 : 0.06;   // out quickly, in gently
  const cap = 0.05;                      // metres a frame, about 3 m a second
  reach += Math.max(-cap, Math.min(cap, gap * speed));
  const d = reach;
  // Never let a hand zoom crop him either. Take the walked distance when it
  // is the shorter of the two: the controls enforce this floor the instant it
  // is set, so handing them the raw fit while the camera is still walking out
  // to it snaps the picture, which is the jump on changing screens.
  controls.minDistance = Math.min(fit(box, p.az, p.el), reach);
  controls.maxDistance = Math.max(d, reach) * 1.9;
  const tx = box.cx + bias.x, ty = box.cy + bias.y, tz = box.cz + bias.z;
  const flat = Math.cos(rad(p.el)) * d;
  controls.target.set(tx, ty, tz);
  camera.position.set(
    tx + flat * Math.sin(rad(p.az)),
    ty + Math.sin(rad(p.el)) * d,
    tz + flat * Math.cos(rad(p.az))
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
  const pick = () => ({
    az: between(view.az), el: between(view.el), room: between(view.room)
  });
  for (let tries = 0; tries < 24; tries++) {
    const p = pick();
    if (Math.abs(arc(from.az, p.az)) > 22 || Math.abs(p.el - from.el) > 6) return p;
  }
  return pick();
}

/** Take the camera over from wherever a person left it, without a jump. */
function takeOver() {
  const { controls } = api();
  const box = measure();
  if (!box) return;
  // Start the walk from where the camera already is, so taking over is silent.
  const c = api().camera.position;
  reach = Math.hypot(c.x - controls.target.x, c.y - controls.target.y,
                     c.z - controls.target.z) || 0;
  bias = {
    x: controls.target.x - box.cx,
    y: controls.target.y - box.cy,
    z: controls.target.z - box.cz
  };
}

let held = null;   // the framing being held between moves

function frame(now) {
  requestAnimationFrame(frame);
  if (!view || !api()) return;

  // Hands off while someone is dragging or zooming, and for a while after.
  if (now < quiet) {
    move = null;
    held = null;
    hold = now + 1200;
    return;
  }
  if (!held) {
    held = pose();
    takeOver();
  }
  if (move) {
    const p = Math.min(1, (now - move.at) / MOVE);
    const k = ease(p);
    const { from, to } = move;
    held = {
      az: from.az + arc(from.az, to.az) * k,
      el: mix(from.el, to.el, k),
      room: mix(from.room, to.room, k)
    };
    if (p >= 1) {
      move = null;
      hold = now + HOLD;
    }
  } else if (now >= hold) {
    move = { at: now, from: held, to: next(held) };
  }
  // Fade out whatever gap we inherited, then re-fit every frame, moving or
  // not, so no pose can ever grow out of the picture.
  bias = { x: bias.x * 0.96, y: bias.y * 0.96, z: bias.z * 0.96 };
  put(held);
}

/* Put the picture back if it is ever empty.
 *
 * Racing through the screens can leave the framing in a state it will not
 * come out of by itself: a measurement taken while the model was between
 * clips, a number that went to nothing, a frame pointed at where he used to
 * be. Rather than hunt every possible order of events, check the obvious
 * thing a few times a second, that some part of him is actually on screen,
 * and start the framing over when it is not. */
function watchPicture() {
  setInterval(() => {
    if (!view || !api()) return;
    const { camera, controls } = api();
    const c = camera.position, t = controls.target;
    const numbersOk = [c.x, c.y, c.z, t.x, t.y, t.z, reach]
      .every(n => Number.isFinite(n));
    let showing = false;
    if (numbersOk && shot) {
      // The eight corners of the box he was last measured in. If not one of
      // them lands on the picture, he is not on it.
      for (const sx of [-shot.hx, shot.hx]) {
        for (const sy of [-shot.hy, shot.hy]) {
          for (const sz of [-shot.hz, shot.hz]) {
            vec.set(shot.cx + sx, shot.cy + sy, shot.cz + sz).project(camera);
            if (Math.abs(vec.x) < 1.6 && Math.abs(vec.y) < 1.6 && vec.z < 1) showing = true;
          }
        }
      }
    }
    if (numbersOk && showing) { empty = 0; return; }
    // Two checks in a row before acting: one is just a clip changing over.
    if (++empty < 2) return;
    empty = 0;
    shot = null;
    skins = null;
    held = null;
    reach = 0;
    bias = { x: 0, y: 0, z: 0 };
  }, 700);
}
let empty = 0;

/* Watch for the graphics context being taken away, and come back from it.
 *
 * The context can be lost at any time and there is no saving the scene when
 * it is: every texture, buffer and shader on it is gone. Reloading is the
 * honest repair. Losing it is not an error to hide, so say so while it comes
 * back. */
function watchContext() {
  const canvas = document.querySelector('canvas');
  let dead = 0;
  const rebuild = () => location.reload();
  canvas.addEventListener('webglcontextlost', (e) => {
    // Without this the browser will not offer the context back at all.
    e.preventDefault();
    const shade = el('shade');
    shade.hidden = false;
    shade.classList.remove('gone');
    shade.textContent = 'ONE MOMENT';
    // If it is handed back, rebuild on the spot; if not, rebuild anyway.
    setTimeout(rebuild, 2500);
  });
  canvas.addEventListener('webglcontextrestored', rebuild);
  // Belt and braces: a context can also be found dead without the event ever
  // arriving, for instance when the tab was asleep as it happened.
  setInterval(() => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl || !gl.isContextLost()) { dead = 0; return; }
    if (++dead >= 2) rebuild();
  }, 1500);
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
  // Measure the new motion from scratch: it stands at a different size.
  shot = null;
  skins = null;
  reach = 0;
  held = null;
  move = null;
  // Open on the framing the viewer chose, then drift away from it.
  hold = performance.now() + 1400;
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
    el(act.button)?.click();
    // The button parks the camera itself. Take it back where it was, easing
    // out the difference rather than snapping.
    setTimeout(() => { if (mine === run && held) takeOver(held); }, 260);
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
  watchPicture();
  watchContext();
  requestAnimationFrame(frame);
  perform(wanted);
  parent.postMessage({ avatarReady: true }, '*');
}

main();
