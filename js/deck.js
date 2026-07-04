/* XMB deck: vertical sections × horizontal card rails.
   Renders rails from data.js, owns all navigation input. */
import { PAL, palette, emit } from './config.js';
import { WORK, PROJECTS, PEOPLE, TROPHIES, CONTACT } from './data.js';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- card templates ---------- */
const workCard = w => `
  <article class="rcard wcard" tabindex="-1">
    <header><b>${esc(w.company)}</b><span>${esc(w.role)}</span></header>
    <div class="meta">${esc(w.where)} · ${esc(w.dates)}</div>
    <ul>${w.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <div class="stack">${esc(w.stack)}</div>
  </article>`;

const projectCard = p => `
  <article class="rcard pcard" tabindex="-1" ${p.links[0] ? `data-href="${p.links[0].href}"` : ''}>
    ${p.passed ? `<div class="wanted"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span><b>MISSION PASSED</b></div>` : ''}
    <header><b>${esc(p.name)}</b></header>
    <span class="tag">${esc(p.tag)}</span>
    <p>${esc(p.desc)}</p>
    <div class="plinks">${p.links.map(l =>
      `<a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div>
  </article>`;

const personCard = r => `
  <article class="rcard qcard" tabindex="-1">
    <div class="qhead"><span class="qav">${esc(r.init)}</span>
      <div class="qwho"><b>${esc(r.name)}</b><span>${esc(r.role)}</span></div></div>
    <q>${esc(r.quote)}</q>
    <span class="qrel">${esc(r.rel)}</span>
  </article>`;

/* ---------- rail controller ---------- */
function makeRail(el, items, template, coverflow){
  el.innerHTML = items.map(template).join('');
  const dots = document.createElement('div');
  dots.className = 'dots';
  dots.innerHTML = items.map(() => '<i></i>').join('');
  el.after(dots);
  const cards = [...el.children];
  let focus = -1;

  function classify(){
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if(d < bestD){ bestD = d; best = i; }
    });
    if(best !== focus){
      focus = best;
      emit('row', {});
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i === focus));
    }
    cards.forEach((c, i) => {
      c.classList.toggle('focus', i === focus);
      if(coverflow){
        c.classList.toggle('near-l', i === focus - 1);
        c.classList.toggle('near-r', i === focus + 1);
        c.classList.toggle('far-l', i < focus - 1);
        c.classList.toggle('far-r', i > focus + 1);
      }
    });
  }
  let raf = null;
  el.addEventListener('scroll', () => {
    if(!raf) raf = requestAnimationFrame(() => { raf = null; classify(); });
  }, {passive:true});

  function to(i){
    const n = Math.max(0, Math.min(cards.length - 1, i));
    const c = cards[n];
    el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  }
  classify();
  return {
    move: d => to(focus + d),
    open: () => {
      const c = cards[focus];
      const href = c.dataset.href || c.querySelector('a')?.href;
      if(href) window.open(href, '_blank', 'noopener');
    },
    classify
  };
}

/* ---------- deck ---------- */
export function initDeck(){
  const deck = document.getElementById('deck');
  const segs = document.getElementById('segs');
  const whereChip = document.getElementById('whereChip');
  const slides = [...deck.children];
  const N = slides.length;
  let idx = 0, lock = 0;

  /* render rails + static data sections */
  const rails = {};
  const railEls = {
    2: [document.querySelector('[data-rail="work"]'), WORK, workCard, false],
    3: [document.querySelector('[data-rail="projects"]'), PROJECTS, projectCard, true],
    4: [document.querySelector('[data-rail="people"]'), PEOPLE, personCard, false]
  };
  for(const k in railEls){
    const [el, items, tpl, flow] = railEls[k];
    if(el) rails[k] = makeRail(el, items, tpl, flow);
  }
  document.querySelector('[data-fill="trophies"]').innerHTML = TROPHIES.map(t =>
    `<div class="tro"><b>${t.n}</b><span>${esc(t.label)}</span></div>`).join('');
  const c = CONTACT;
  document.querySelector('[data-fill="contact-links"]').innerHTML =
    c.links.map(l => `<a class="chip" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');

  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', s.dataset.name);
    b.addEventListener('click', () => go(i));
    segs.appendChild(b);
  });

  function paint(){
    deck.style.transform = `translate3d(0, ${-idx * innerHeight}px, 0)`;
    palette.tgt = PAL[idx];
    [...segs.children].forEach((b, i) => b.classList.toggle('on', i <= idx));
    whereChip.textContent = `[0${idx}] ${slides[idx].dataset.name}`;
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== idx);
      s.classList.toggle('active', i === idx);
    });
    if(rails[idx]) rails[idx].classify();
  }

  function go(i){
    const n = Math.max(0, Math.min(N - 1, i));
    if(n === idx) return;
    const fwd = n > idx;
    idx = n; paint();
    emit('nav', { index: idx, fwd });
  }

  addEventListener('resize', paint);

  /* inputs */
  document.getElementById('nextBtn').addEventListener('click', () => go(idx + 1));
  document.getElementById('prevBtn').addEventListener('click', () => go(idx - 1));

  addEventListener('keydown', e => {
    if(['ArrowDown','PageDown',' '].includes(e.key)){ e.preventDefault(); go(idx + 1); }
    else if(['ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); go(idx - 1); }
    else if(e.key === 'ArrowLeft' && rails[idx]) rails[idx].move(-1);
    else if(e.key === 'ArrowRight' && rails[idx]) rails[idx].move(1);
    else if(e.key === 'Enter' && rails[idx]) rails[idx].open();
  });

  addEventListener('wheel', e => {
    const rail = e.target.closest && e.target.closest('.rail');
    if(rail){ rail.scrollLeft += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY); return; }
    const now = Date.now();
    if(now - lock < 950 || Math.abs(e.deltaY) < 12) return;
    lock = now;
    go(idx + (e.deltaY > 0 ? 1 : -1));
  }, {passive:true});

  let ty = null, tx = null, inRail = false;
  addEventListener('touchstart', e => {
    ty = e.touches[0].clientY; tx = e.touches[0].clientX;
    inRail = !!(e.target.closest && e.target.closest('.rail'));
  }, {passive:true});
  addEventListener('touchend', e => {
    if(ty === null) return;
    const dy = ty - e.changedTouches[0].clientY;
    const dx = tx - e.changedTouches[0].clientX;
    ty = tx = null;
    if(inRail && Math.abs(dx) > Math.abs(dy)) return;   /* rail handled it */
    if(Math.abs(dy) > 55 && Math.abs(dy) > Math.abs(dx)) go(idx + (dy > 0 ? 1 : -1));
  }, {passive:true});

  paint();
  return { go };
}
