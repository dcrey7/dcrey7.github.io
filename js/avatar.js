/* The live 3D character in the middle of ABOUT.
 *
 * The scene itself is the motion playground built for the Sleeping Dogs
 * retarget: it already solves the skeleton, the desk and chair heights, the
 * typing reach and the props. So this file does not rebuild any of that. It
 * hosts that page in a frame and tells it which motion to play.
 *
 * Two mounting styles, for one reason: moving an iframe to a new parent
 * reloads it, and reloading means parsing the model again. The desktop cross
 * re-renders the hero on every item, so the frame lives in one fixed place and
 * only gets a message when the screen changes. The phone opens one drop-down
 * at a time, so there a frame is simply created and thrown away.
 */

/* The version belongs here as well as inside the page. Bumping only the
   script tags inside embed.html is useless while embed.html itself is the
   cached thing: the browser keeps serving the old page, old tags and all. */
const PAGE = 'assets/avatar/play/embed.html?v=2026-09-07k&embed=1&act=';
function build(kind) {
  const made = { kind };
  const wrap = document.createElement('div');
  wrap.className = 'avatar';

  const frame = document.createElement('iframe');
  frame.className = 'avatar__stage';
  frame.src = PAGE + encodeURIComponent(kind);
  frame.title = 'Abhishek in 3D';
  frame.loading = 'lazy';
  /* The frame rebuilds itself if the browser takes its graphics context
     away, and it comes back on the motion named in its address, which by
     then may not be the screen you are on. Tell it again on every load. */
  frame.addEventListener('load', () => {
    frame.contentWindow?.postMessage({ avatarAct: made.kind }, '*');
  });
  wrap.appendChild(frame);
  made.wrap = wrap;
  made.frame = frame;
  made.settleBy = Date.now() + GRACE;
  watch(made);

  return made;
}

const GRACE = 30000;   // how long a fresh frame is given to load the model
const BEAT = 2000;     // how often it is checked once it has settled
const STRIKES = 3;     // consecutive bad checks before it is rebuilt

/** Is there a living 3D scene in there, on a canvas that still has a GPU? */
function alive(made) {
  try {
    const w = made.frame.contentWindow;
    if (!w || !w.avatarView) return false;
    const canvas = w.document.querySelector('canvas');
    if (!canvas) return false;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl && !gl.isContextLost();
  } catch {
    return false;   // a frame that cannot be reached is not a working one
  }
}

/** Rebuild the frame if the picture is dead while it is meant to be showing. */
function watch(made) {
  let strikes = 0;
  setInterval(() => {
    if (made.wrap.hidden) return;             // not on screen, nothing to judge
    if (Date.now() < made.settleBy) return;   // still loading, give it time
    if (alive(made)) { strikes = 0; return; }
    if (++strikes < STRIKES) return;
    strikes = 0;
    made.settleBy = Date.now() + GRACE;
    // A new address, so the browser fetches rather than reuses the dead page.
    made.frame.src = PAGE + encodeURIComponent(made.kind) + '&r=' + Date.now();
  }, BEAT);
}

/* ---------- desktop: one frame, reused ---------- */

let live;

/** Show the character on the desktop cross. Returns the function that hides it. */
export function showAvatar(kind) {
  if (!live) {
    const host = document.querySelector('.detail');
    if (!host) return () => {};
    live = build(kind);
    // The shelf stays at the bottom of the column, so the character sits
    // between the title and it.
    host.insertBefore(live.wrap, document.getElementById('shelf'));
  } else if (kind !== live.kind) {
    live.kind = kind;
    // The frame may still be loading its model. Its own script replays the
    // last act it was told about, so an early message is not lost.
    live.frame.contentWindow?.postMessage({ avatarAct: kind }, '*');
  }
  live.wrap.hidden = false;
  return hideAvatar;
}

export function hideAvatar() {
  // Hidden, not removed. A removed iframe is destroyed and would have to load
  // the model again on the way back. Hidden costs nothing: the browser stops
  // running its animation frames.
  if (live) live.wrap.hidden = true;
}

/* ---------- phone: one frame per open drop-down ---------- */

export function mountAvatar(host, kind) {
  const made = build(kind);
  host.appendChild(made.wrap);
  return () => made.wrap.remove();
}
