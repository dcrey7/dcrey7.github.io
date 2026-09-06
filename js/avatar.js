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

const PAGE = 'assets/avatar/play/embed.html?embed=1&act=';
const HINT = () => matchMedia('(pointer: coarse)').matches
  ? 'drag to turn, pinch to zoom'
  : 'drag to turn, scroll to zoom';

function build(kind) {
  const wrap = document.createElement('div');
  wrap.className = 'avatar';

  const frame = document.createElement('iframe');
  frame.className = 'avatar__stage';
  frame.src = PAGE + encodeURIComponent(kind);
  frame.title = 'Abhishek in 3D';
  frame.loading = 'lazy';
  wrap.appendChild(frame);

  const hint = document.createElement('p');
  hint.className = 'avatar__hint';
  hint.textContent = HINT();
  wrap.appendChild(hint);

  return { wrap, frame, kind };
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
