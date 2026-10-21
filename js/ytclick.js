/* A demo video that loads from YouTube only when the visitor clicks it.

   Before the click the box is plain: a play button, the title and a one
   line note. Nothing is fetched from YouTube or Google. The click swaps
   the box for the real player (youtube-nocookie.com), which starts. */

export function videoOnClick(videoId, title) {
  const box = document.createElement('div');
  box.className = 'hero__video ytclick';

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'ytclick__play';
  play.setAttribute('aria-label', `Play the ${title} video`);
  play.innerHTML =
    '<svg viewBox="0 0 16 16" width="28" height="28" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg>';

  const name = document.createElement('span');
  name.className = 'ytclick__title';
  name.textContent = title;

  const note = document.createElement('span');
  note.className = 'ytclick__note';
  note.textContent = 'Plays via YouTube (Google)';

  box.append(play, name, note);

  play.addEventListener('click', e => {
    e.stopPropagation();
    const frame = document.createElement('iframe');
    frame.className = 'hero__video';
    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    frame.title = `${title} demo`;
    frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    box.replaceWith(frame);
  });
  return box;
}
