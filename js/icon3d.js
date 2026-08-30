/* A 3D icon, spinning on the Y axis, drawn on a small canvas.

   No library. The icon is its SVG path (a Path2D takes the same string).
   The extrusion: for a turn of angle A about Y, a point at depth z lands
   at x·cos A + z·sin A on screen. The shape squeezed by cos A is drawn
   ONCE into an offscreen canvas in the side colour, then stamped along x
   at one pixel steps from the back face to the front face: the stamps
   overlap, so the side is one solid body, and the face nearest the viewer
   goes on top in the face colour. Orthographic, right for this size.

   Edge on (A near 90°) the squeeze would be zero, so the width never
   drops under a small minimum: the side band stays solid at every angle,
   no blink at the quarter turn.

   Materials: 'flat' (the element's colour, a darker side) or 'chrome'
   (silver: a sky/horizon gradient that slides as the piece turns).

   Several canvases can spin at once, one loop for all. A canvas is
   registered under a group name; a new one in the group replaces it. */

const DEPTH = 3.2;      /* thickness, in the icon's own 24 unit grid   */
const TURN = 6;         /* seconds per full turn at speed 1            */
const MIN_W = 0.03;     /* a face is never narrower than 3% of full    */

const active = new Map();
let raf = 0, last = 0, frames = 0;

function darken(css) {
  const m = css.match(/[\d.]+/g);
  if (!m || m.length < 3) return css;
  const [r, g, b] = m.map(Number);
  return `rgb(${r * 0.55 | 0}, ${g * 0.55 | 0}, ${b * 0.55 | 0})`;
}

/* CHROME = a mirror of its surroundings. The surroundings are a real
   studio photo (an equirectangular panorama: x is the compass direction,
   y is up to down). For a surface with normal n seen straight on, the
   reflected direction is r = 2(n·v)n - v. The face is treated as a soft
   pillow, so its normal leans up at the top and down at the bottom: the
   reflection sweeps an arc of the panorama from ceiling to floor, which
   is the light/horizon/floor banding chrome shows. The compass direction
   is twice the turn angle, so the reflection slides as the piece turns.
   The side of the extrusion faces sideways: its own direction, its own
   band. The panorama is sampled into gradients, 32 stops each. */
let env = null;          /* { data, w, h } of the panorama            */
const STOPS = 32;

export function setEnv(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  env = { data: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
}

/* the panorama colour in direction (azimuth in radians, elevation -1..1) */
function sample(az, el) {
  const u = ((az / (2 * Math.PI)) % 1 + 1) % 1;
  const v = Math.min(1, Math.max(0, (1 - el) / 2));
  const px = Math.min(env.w - 1, u * env.w | 0), py = Math.min(env.h - 1, v * env.h | 0);
  const i = (py * env.w + px) * 4;
  return `rgb(${env.data[i]},${env.data[i + 1]},${env.data[i + 2]})`;
}

/* a vertical gradient over the icon box (0..24) that reflects the
   panorama around compass direction `az`, from elevation +lean (top of
   the face) down to -lean (bottom); `gain` darkens the side */
function chromeGrad(c, az, lean, gain) {
  const g = c.createLinearGradient(0, 0, 0, 24);
  for (let i = 0; i <= STOPS; i++) {
    const t = i / STOPS;
    const el = lean * (1 - 2 * t);          /* +lean at the top .. -lean */
    let col = sample(az + (t - 0.5) * 0.35, el);
    if (gain !== 1) {
      const m = col.match(/\d+/g).map(Number);
      col = `rgb(${m[0] * gain | 0},${m[1] * gain | 0},${m[2] * gain | 0})`;
    }
    g.addColorStop(t, col);
  }
  return g;
}

/* without a panorama, a built in studio: white lights over a dark floor */
function chromeFallback(c, shift, dark) {
  const g = c.createLinearGradient(0, 0, 0, 24);
  const k = (t) => Math.min(1, Math.max(0, t + shift));
  const stops = dark
    ? [[0, '#9aa0a8'], [.45, '#3b4047'], [.55, '#23262b'], [1, '#7d838b']]
    : [[0, '#fbfbfc'], [.2, '#c6cad0'], [.4, '#ffffff'], [.5, '#5c6169'], [.56, '#30343a'], [.72, '#b7bcc4'], [.88, '#f1f2f4'], [1, '#868b93']];
  stops.forEach(([t, col]) => g.addColorStop(k(t), col));
  return g;
}

function chrome(c, angle, dark) {
  if (!env) return chromeFallback(c, Math.sin(angle) * 0.12, dark);
  /* the face reflects around twice the turn angle; the side looks a
     quarter turn away from the face */
  const az = dark ? 2 * angle + Math.PI / 2 : 2 * angle;
  return chromeGrad(c, az, dark ? 0.35 : 0.8, dark ? 0.7 : 1);
}

function drawOne(it, dt) {
  const { canvas, ctx, off, octx, path } = it;
  const w = canvas.width, h = canvas.height;
  it.angle += (dt / 1000 / TURN) * Math.PI * 2 * it.speed;
  const a = it.angle;
  const cosA = Math.cos(a), sinA = Math.sin(a);
  /* with a reflection the icon lives in the top square of a taller
     canvas and its mirror hangs below; without, it is centred */
  const s = (Math.min(w, h) * it.fit) / 24;   /* px per icon unit */
  const cx = w / 2;
  const cy0 = it.reflect ? w / 2 : h / 2;
  /* the revolving icon also BOBS: a small rise and fall (2.2 s, under
     one grid unit). The still ones stay planted. */
  it.t = (it.t || 0) + dt;
  const bob = it.speed > 0 ? Math.sin(it.t / 1000 * (Math.PI * 2 / 2.2)) * 0.7 * s : 0;
  const cy = cy0 - bob;
  const sx = Math.max(Math.abs(cosA), MIN_W) * (cosA < 0 ? -1 : 1);
  const sideFill = it.material === 'chrome' ? chrome(octx, a, true) : it.side;
  const faceFill = it.material === 'chrome' ? chrome(ctx, a, false) : it.colour;

  /* the squeezed shape, once, in the side colour */
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.clearRect(0, 0, w, h);
  octx.setTransform(sx * s, 0, 0, s, cx - 12 * sx * s, cy - 12 * s);
  octx.fillStyle = sideFill;
  octx.fill(path);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  /* stamp it from the back face to the front face, one pixel apart */
  const front = cosA >= 0 ? DEPTH / 2 : -DEPTH / 2;
  const back = -front;
  const xBack = back * sinA * s, xFront = front * sinA * s;
  const steps = Math.max(1, Math.ceil(Math.abs(xFront - xBack)));
  for (let i = 0; i <= steps; i++) {
    const x = xBack + (xFront - xBack) * (i / steps);
    ctx.drawImage(off, x, 0);
  }
  /* the face on top */
  ctx.setTransform(sx * s, 0, 0, s, cx + xFront - 12 * sx * s, cy - 12 * s);
  ctx.fillStyle = faceFill;
  ctx.fill(path);

  /* the reflection: the drawn icon mirrored under its own base, dim, and
     faded out towards the bottom. Same frame, so it turns with the icon. */
  if (it.reflect) {
    /* the floor does not bob: the mirror line stays put, so the gap
       between the icon and its reflection breathes with the bounce */
    const gap = 0.6 * s;
    const yBase = cy0 + 12 * s + gap;                    /* the mirror line */
    const yTop = Math.max(0, cy0 - 12 * s - 1.2 * s);    /* covers the rise */
    const hRef = Math.min(h - yBase, 12 * s);            /* reflection height */
    if (hRef > 2) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.translate(0, 2 * yBase);
      ctx.scale(1, -1);
      ctx.drawImage(canvas, 0, yTop, w, yBase - gap - yTop, 0, yTop, w, yBase - gap - yTop);
      ctx.restore();
      const fade = ctx.createLinearGradient(0, yBase, 0, yBase + hRef);
      fade.addColorStop(0, 'rgba(0,0,0,0.25)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade;
      ctx.fillRect(0, yBase, w, h - yBase);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}

function loop(now) {
  const dt = last ? Math.min(now - last, 50) : 16;   /* a tab switch is not a jump */
  last = now;
  for (const [group, it] of active) {
    if (!it.canvas.isConnected) { active.delete(group); continue; }
    drawOne(it, dt);
  }
  if ((++frames % 60) === 0) recolour();   /* the mode can change the palette */
  raf = active.size ? requestAnimationFrame(loop) : 0;
}

/* show `el` (a canvas with data-d = the SVG path) in 3D. Options:
   group (a new canvas in a group replaces the old one), fit (the icon's
   share of the canvas), material ('flat' | 'chrome'), angle (radians;
   with speed 0 the piece stands still at that angle), speed (turn rate),
   reflect (a faded mirror under the icon; the canvas must be taller than
   wide, the icon takes the top square).
   The colour is the element's computed colour, so the palette applies. */
export function spin(el, opts = {}) {
  const { group = 'deck', fit = 0.6, material = 'flat', angle = null, speed = null, reflect = false } = opts;
  if (!el) { active.delete(group); return; }
  /* backing store from the LAYOUT size, with room for a CSS scale up to
     1.25, so a mid transition measurement can never leave it soft */
  const dpr = Math.min(devicePixelRatio || 1, 2) * 1.25;
  /* a hidden canvas measures 0: give it a sane size rather than 1 px
     (which CSS would stretch into a solid block) */
  const cw = el.offsetWidth || 200, ch = el.offsetHeight || 200;
  el.width = Math.max(1, Math.round(cw * dpr));
  el.height = Math.max(1, Math.round(ch * dpr));
  const off = document.createElement('canvas');
  off.width = el.width; off.height = el.height;
  const colour = getComputedStyle(el).color;
  /* one registration per canvas: if it was the still "next" a moment ago
     and is now the revolving one, the old entry must not keep drawing */
  for (const [g, it] of active) if (g !== group && it.canvas === el) active.delete(g);
  const prev = active.get(group);
  active.set(group, {
    canvas: el, ctx: el.getContext('2d'), off, octx: off.getContext('2d'),
    path: new Path2D(el.dataset.d || ''),
    colour, side: darken(colour), fit, material, reflect,
    speed: speed !== null ? speed : 1,
    angle: angle !== null ? angle : (prev ? prev.angle : 0)   /* a change keeps the phase */
  });
  if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
}

export function setSpeed(mult, group = 'deck') {
  const it = active.get(group);
  if (it) it.speed = mult;
}

export function stop(group) {
  active.delete(group);
}

export function recolour() {
  for (const it of active.values()) {
    const c = getComputedStyle(it.canvas).color;
    if (c !== it.colour) { it.colour = c; it.side = darken(c); }
  }
}
