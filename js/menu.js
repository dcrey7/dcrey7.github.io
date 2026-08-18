/* The Cross Media Bar model.

   Horizontal axis = categories. Vertical axis = the items inside the selected
   category. They cross at a fixed point on screen. This is the PS3 XMB
   structure wearing the PS5's dark, focus-reactive skin.

   Category { id, label, mark, key, logo?, items[] }
   Item     { id, mark, key, logo?, title, sub, meta, badge, body, action, cards[] }

   `logo` is optional and is a path under assets/ (set in data.js, e.g.
   'work/amazon_logo.jpeg'). If the file is missing the renderer falls back
   to `mark`, so images can be dropped in later without touching code. */

import { ABOUT, WORK, PROJECTS, PEOPLE, TROPHIES, CERTS, EDUCATION, CONTACT } from './data.js';

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const host = url => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
};

/* ---------- ABOUT: one intro item, the afaicon is its image ---------- */
const about = {
  id: 'about', label: 'ABOUT', mark: null, icon: true, key: ABOUT.key,
  items: [{
    id: 'intro', mark: '☻', key: ABOUT.key,
    title: ABOUT.title, sub: ABOUT.sub, meta: ABOUT.meta, badge: null,
    body: 'Making LLMs behave at Vistiq.AI, Paris. 5+ years turning data science into shipped systems, Amazon to AXA to AI native startups. Masters in Data Science & AI, emlyon 2026.',
    action: null, cards: []
  }]
};

/* ---------- EDUCATION: its own category, right after experience ---------- */
const education = {
  id: 'education', label: 'EDUCATION', mark: '🎓', key: '#C8102E',
  items: EDUCATION.map(e => ({
    id: slug(e.school), mark: e.mark, key: e.key, logo: e.logo,
    title: e.school, sub: 'education', meta: null, badge: null,
    body: e.line,
    action: e.href ? { label: 'verify diploma', href: e.href } : null,
    cards: []
  }))
};

/* ---------- WORK ---------- */
const work = {
  id: 'work', label: 'WORK', mark: '▣', key: '#2F6BFF',
  items: WORK.map(j => ({
    id: slug(j.company), mark: j.mark, key: j.key, logo: j.logo,
    title: j.company.toUpperCase(),
    sub: j.role,
    meta: `${j.where} · ${j.dates}`,
    badge: null,
    body: null,
    bullets: j.bullets,
    stack: j.stack,
    action: null,
    cards: []
  }))
};

/* ---------- PLAY ---------- */
/* Only projects with real media survive (user rule); links that duplicate
   the embedded video are dropped. */
const play = {
  id: 'play', label: 'PLAY', mark: '▶', key: '#16A34A',
  items: PROJECTS.filter(p => p.video || (p.photos && p.photos.length) || p.logo)
    .map(p => ({
    id: slug(p.name), mark: p.mark, key: p.key, logo: p.logo,
    title: p.name,
    sub: p.tag,
    meta: null,
    badge: p.passed ? 'MISSION PASSED' : null,
    body: p.desc,
    action: p.links[0] || null,
    video: p.video || null,
    photos: p.photos || [],
    /* no duplicates: drop links the video embed or the action button covers */
    cards: p.links.slice(1)
      .filter(l => !(p.video && /youtu/.test(l.href)))
      .map(l => ({ kicker: 'OPEN', title: l.label, body: host(l.href), href: l.href }))
  }))
};

/* ---------- PEOPLE ---------- */
const people = {
  id: 'people', label: 'PEOPLE', mark: '❝', key: '#8B5CF6',
  items: [{
    id: 'add-yours', mark: '+', key: '#8B5CF6', form: true,
    title: 'ADD YOURS', sub: 'worked with me?', meta: null, badge: null,
    body: 'Worked with me and have something to say? Fill the form. Your recommendation lands in my review queue, and once I approve it, it appears right here with the others.',
    action: null,
    cards: []
  },
  ...PEOPLE.map(p => ({
    id: slug(p.name), mark: p.init, key: '#8B5CF6', logo: p.photo,
    title: p.name.toUpperCase(),
    sub: p.role,
    meta: p.rel,
    badge: null,
    body: `“${p.quote}”`,
    action: null,
    cards: []
  }))]
};

/* ---------- TROPHIES ---------- */
/* The trophy cabinet: certifications with a badge image (user rule), each
   opening its public verification link. */
const trophies = {
  id: 'trophies', label: 'TROPHIES', mark: '★', key: '#F59E0B',
  items: CERTS.filter(c => c.logo).map(c => ({
    id: slug(c.name), mark: c.mark, key: c.key, logo: c.logo,
    title: c.name,
    sub: c.issuer,
    meta: null,
    badge: null,
    body: null,
    action: { label: '✓ verify', href: c.href },
    cards: []
  }))
};

/* ---------- CONTACT ---------- */
const contact = {
  id: 'contact', label: 'CONTACT', mark: '✉', key: '#EC4899',
  items: [
    {
      id: 'email', mark: '✉', key: '#EC4899',
      title: 'EMAIL', sub: 'the fastest way', meta: CONTACT.where, badge: null,
      body: CONTACT.email,
      action: { label: `✉ ${CONTACT.email}`, href: `mailto:${CONTACT.email}` },
      cards: []
    },
    ...CONTACT.links.map(l => ({
      id: slug(l.label), mark: l.label.slice(0, 2), key: '#EC4899',
      title: l.label, sub: host(l.href), meta: null, badge: null,
      body: null,
      action: { label: `open ${l.label.toLowerCase()}`, href: l.href },
      cards: []
    }))
  ]
};

export const CATEGORIES = [about, work, education, play, people, trophies, contact];
