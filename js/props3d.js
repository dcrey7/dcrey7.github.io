/* The category icons, as real 3D props.

   Same shape of API as js/icon3d.js, which draws the flat glyphs by extruding
   their SVG path: spin, stop, setSpeed, recolour. A canvas that names a prop
   in data-prop gets the model; anything else falls through to the flat icon,
   so INTRO keeps its glyph until the head is done, and nothing is ever blank.

   ONE renderer for the whole bar. Seven WebGL contexts is not a thing to do:
   browsers cap them at about sixteen and the character in the middle of the
   page already spends one. So there is a single offscreen renderer, and each
   icon's own 2D canvas gets the pixels copied into it. Seven copies a frame at
   this size costs nothing.

   The models come from Tripo at about 3,700 triangles with a 256 texture, and
   are centred and scaled into a common cube when they are built, so one camera
   frames every one of them the same way. */

import { spin as flatSpin, stop as flatStop,
         setSpeed as flatSetSpeed, recolour as flatRecolour } from './icon3d.js?v=2026-09-09b';

const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js';
const LOADER_URL = './vendor/GLTFLoader.js';
/* The version rides on the model address too. Without it a rebuilt prop
   sits in the browser cache for hours and the bar keeps the old one. */
const PROPS_VERSION = '2026-09-08g';
const MODEL = (name) => `assets/props/${name}.glb?v=${PROPS_VERSION}`;

const TURN = 6;         /* seconds per full turn at speed 1, as the glyphs do */
const FOV = 30;         /* the lens, in degrees                               */
const RADIUS = 1.24;    /* how much room to leave around them. The full cube
                           diagonal, 1.74, never clips but leaves them small:
                           they are not solid cubes, so this is the swing that
                           actually matters and they come out far bigger.   */
const BOB = 2.2;        /* seconds per rise and fall                          */
const BOB_H = 0.045;    /* how far it rises, in model units                   */
/* Every prop, the bust included, was built with its front on +X: side on to
   the camera at angle zero. A quarter turn puts the front on +Z, facing the
   camera, so that the tilts the bar asks for mean what they say: previous
   cards look right, next cards look left, all of them toward the selection. */
const FRONT = -Math.PI / 2;

/* Motion is opt in. With reduced motion asked for, the props stand still
   and do not bob; they are still the real models, only at rest. */
const STILL = matchMedia('(prefers-reduced-motion: reduce)');

const active = new Map();   /* group -> what to draw               */
const models = new Map();   /* prop name -> Promise of a scene     */
let three = null, loader = null, renderer = null, scene = null, camera = null;
let raf = 0, last = 0;
let broken = false;         /* once WebGL fails, stay on the flat icons */

/** Load three and the loader once, and build the one renderer.
 *
 *  Once means once. Every icon on the page calls this in the same tick,
 *  long before the first import has resolved, so a guard on `renderer`
 *  alone let fourteen boots run and open fourteen WebGL contexts. Chrome
 *  allows about sixteen: the phone, with its seven rows on top of the
 *  hidden desktop bar, tipped over, the oldest context was lost, and every
 *  icon fell back to the flat glyph. The promise is the guard. */
let booting = null;
function boot() {
  if (!booting) booting = bootOnce();
  return booting;
}

async function bootOnce() {
  if (renderer || broken) return !broken;
  try {
    const [T, L] = await Promise.all([import(THREE_URL), import(LOADER_URL)]);
    three = T;
    loader = new L.GLTFLoader();
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1);          /* the target canvas owns the scaling */
    renderer.outputColorSpace = T.SRGBColorSpace;
    scene = new T.Scene();
    /* Flat, even light: these are painted models, so the texture should carry
       the shading rather than the lamps. */
    scene.add(new T.HemisphereLight(0xffffff, 0x556070, 2.6));
    const key = new T.DirectionalLight(0xffffff, 1.9);
    key.position.set(-2, 3, 4);
    scene.add(key);
    camera = new T.PerspectiveCamera(30, 1, 0.1, 40);
    /* If the browser takes the GPU away, every icon goes to its flat glyph
       at once. A dead renderer painted nothing and left the bar blank. */
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      broken = true;
      for (const [g, it] of [...active]) { active.delete(g); fallback(it.canvas, it.opts); }
    });
    return true;
  } catch (e) {
    broken = true;
    return false;
  }
}

function load(name) {
  if (!models.has(name)) {
    models.set(name, new Promise((done) => {
      loader.load(MODEL(name),
        (gltf) => done(gltf.scene),
        undefined,
        () => done(null));      /* a missing model is not worth an exception */
    }));
  }
  return models.get(name);
}

/** Draw one item into its own canvas. */
function paint(it, now) {
  if (!it.model) return;
  const w = it.canvas.width, h = it.canvas.height;
  if (!w || !h) return;
  /* reflect: the icon uses the top square and its mirror sits underneath */
  const side = it.reflect ? Math.min(w, Math.round(h / 2)) : Math.min(w, h);
  if (renderer.domElement.width !== side || renderer.domElement.height !== side) {
    renderer.setSize(side, side, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  scene.add(it.model);
  it.model.rotation.y = it.angle + FRONT;
  it.model.position.y = it.bob && !STILL.matches
    ? Math.sin(now / (BOB * 1000) * Math.PI * 2) * BOB_H : 0;
  /* Stand back far enough that the whole thing fits however it is turned.
     The models are built two units across, so the furthest any corner can
     swing is half the diagonal of that cube. Framing on the flat width
     instead is what let the corners clip as they came round. */
  camera.position.set(0, 0.25, RADIUS / (Math.tan(FOV / 2 * Math.PI / 180) * it.fit));
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  scene.remove(it.model);

  const ctx = it.ctx;
  ctx.clearRect(0, 0, w, h);
  const x = (w - side) / 2;
  ctx.drawImage(renderer.domElement, x, 0, side, side);
  if (it.reflect) {
    /* The reflection is drawn on its own, faded out downwards, then wiped
       with a gradient. Drawn flat it hangs at one strength all the way down
       and reads as a second icon sitting under the bar. */
    const mirror = mirrorCanvas(side);
    const mx = mirror.getContext('2d');
    mx.clearRect(0, 0, side, side);
    mx.save();
    mx.translate(0, side);
    mx.scale(1, -1);
    mx.drawImage(renderer.domElement, 0, 0, side, side);
    mx.restore();
    const fade = mx.createLinearGradient(0, 0, 0, side);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0)');
    mx.globalCompositeOperation = 'destination-in';
    mx.fillStyle = fade;
    mx.fillRect(0, 0, side, side);
    mx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.drawImage(mirror, x, side, side, side);
    ctx.restore();
  }
}

/* One scratch canvas for the mirrored copy, reused, sized to whatever the
   biggest icon needs. Making one per frame would churn memory for nothing. */
let mirror = null;
function mirrorCanvas(side) {
  if (!mirror) mirror = document.createElement('canvas');
  if (mirror.width !== side) { mirror.width = side; mirror.height = side; }
  return mirror;
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
  last = now;
  for (const it of active.values()) {
    if (!STILL.matches) it.angle += dt * it.speed * (Math.PI * 2) / TURN;
    paint(it, now);
  }
  if (!active.size) { cancelAnimationFrame(raf); raf = 0; last = 0; }
}

/* ---------- the same API the flat icons offer ---------- */

/** The flat glyph, marked as such so a page can tell which renderer it got. */
function fallback(el, opts) {
  if (el && el.dataset) el.dataset.renderer = 'fallback';
  return flatSpin(el, opts);
}

export function spin(el, opts = {}) {
  const name = el && el.dataset ? el.dataset.prop : null;
  /* No prop named, or WebGL has already failed: the flat glyph does the job. */
  if (!name || broken) return fallback(el, opts);

  const { group = 'deck', fit = 0.6, angle = null, speed = null, reflect = false } = opts;
  const dpr = Math.min(devicePixelRatio || 1, 2) * 1.25;
  const cw = el.offsetWidth || 200, ch = el.offsetHeight || 200;
  el.width = Math.max(1, Math.round(cw * dpr));
  el.height = Math.max(1, Math.round(ch * dpr));

  /* One registration per canvas, as the flat renderer does: a canvas that was
     the still one a moment ago must not keep drawing under its old group. */
  for (const [g, it] of active) if (g !== group && it.canvas === el) active.delete(g);
  const prev = active.get(group);
  const it = {
    canvas: el, ctx: el.getContext('2d'), name, opts,
    fit, reflect, model: prev && prev.name === name ? prev.model : null,
    speed: speed !== null ? speed : 1,
    bob: (speed !== null ? speed : 1) > 0,
    angle: angle !== null ? angle : (prev ? prev.angle : 0.6)
  };
  active.set(group, it);

  boot().then((ok) => {
    if (!ok) { active.delete(group); return fallback(el, opts); }
    if (it.model) { el.dataset.renderer = 'prop'; return; }
    load(name).then((model) => {
      if (active.get(group) !== it) return;
      if (!model) { active.delete(group); fallback(el, opts); return; }
      it.model = model;
      el.dataset.renderer = 'prop';
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
  });
  if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
}

export function stop(group) {
  active.delete(group);
  flatStop(group);
}

export function setSpeed(mult, group = 'deck') {
  const it = active.get(group);
  if (it) { it.speed = mult; it.bob = mult > 0; }
  flatSetSpeed(mult, group);
}

/* The props carry their own colours, so there is nothing to recolour here.
   The flat icons still follow the palette, and INTRO is still one of those. */
export function recolour() {
  flatRecolour();
}
