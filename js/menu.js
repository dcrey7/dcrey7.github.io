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

/* One consistent icon family for the deck: Google Material Icons
   (Apache 2.0), 24px paths, drawn inline so nothing is fetched. */
export const ICONS = {
  person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  work: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  school: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  gamepad: 'M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
  group: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  /* brand marks from Simple Icons (CC0), same 24px grid */
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  huggingface: 'M12.025 1.13c-5.77 0-10.449 4.647-10.449 10.378 0 1.112.178 2.181.503 3.185.064-.222.203-.444.416-.577a.96.96 0 0 1 .524-.15c.293 0 .584.124.84.284.278.173.48.408.71.694.226.282.458.611.684.951v-.014c.017-.324.106-.622.264-.874s.403-.487.762-.543c.3-.047.596.06.787.203s.31.313.4.467c.15.257.212.468.233.542.01.026.653 1.552 1.657 2.54.616.605 1.01 1.223 1.082 1.912.055.537-.096 1.059-.38 1.572.637.121 1.294.187 1.967.187.657 0 1.298-.063 1.921-.178-.287-.517-.44-1.041-.384-1.581.07-.69.465-1.307 1.081-1.913 1.004-.987 1.647-2.513 1.657-2.539.021-.074.083-.285.233-.542.09-.154.208-.323.4-.467a1.08 1.08 0 0 1 .787-.203c.359.056.604.29.762.543s.247.55.265.874v.015c.225-.34.457-.67.683-.952.23-.286.432-.52.71-.694.257-.16.547-.284.84-.285a.97.97 0 0 1 .524.151c.228.143.373.388.43.625l.006.04a10.3 10.3 0 0 0 .534-3.273c0-5.731-4.678-10.378-10.449-10.378M8.327 6.583a1.5 1.5 0 0 1 .713.174 1.487 1.487 0 0 1 .617 2.013c-.183.343-.762-.214-1.102-.094-.38.134-.532.914-.917.71a1.487 1.487 0 0 1 .69-2.803m7.486 0a1.487 1.487 0 0 1 .689 2.803c-.385.204-.536-.576-.916-.71-.34-.12-.92.437-1.103.094a1.487 1.487 0 0 1 .617-2.013 1.5 1.5 0 0 1 .713-.174m-10.68 1.55a.96.96 0 1 1 0 1.921.96.96 0 0 1 0-1.92m13.838 0a.96.96 0 1 1 0 1.92.96.96 0 0 1 0-1.92M8.489 11.458c.588.01 1.965 1.157 3.572 1.164 1.607-.007 2.984-1.155 3.572-1.164.196-.003.305.12.305.454 0 .886-.424 2.328-1.563 3.202-.22-.756-1.396-1.366-1.63-1.32q-.011.001-.02.006l-.044.026-.01.008-.03.024q-.018.017-.035.036l-.032.04a1 1 0 0 0-.058.09l-.014.025q-.049.088-.11.19a1 1 0 0 1-.083.116 1.2 1.2 0 0 1-.173.18q-.035.029-.075.058a1.3 1.3 0 0 1-.251-.243 1 1 0 0 1-.076-.107c-.124-.193-.177-.363-.337-.444-.034-.016-.104-.008-.2.022q-.094.03-.216.087-.06.028-.125.063l-.13.074q-.067.04-.136.086a3 3 0 0 0-.135.096 3 3 0 0 0-.26.219 2 2 0 0 0-.12.121 2 2 0 0 0-.106.128l-.002.002a2 2 0 0 0-.09.132l-.001.001a1.2 1.2 0 0 0-.105.212q-.013.036-.024.073c-1.139-.875-1.563-2.317-1.563-3.203 0-.334.109-.457.305-.454m.836 10.354c.824-1.19.766-2.082-.365-3.194-1.13-1.112-1.789-2.738-1.789-2.738s-.246-.945-.806-.858-.97 1.499.202 2.362c1.173.864-.233 1.45-.685.64-.45-.812-1.683-2.896-2.322-3.295s-1.089-.175-.938.647 2.822 2.813 2.562 3.244-1.176-.506-1.176-.506-2.866-2.567-3.49-1.898.473 1.23 2.037 2.16c1.564.932 1.686 1.178 1.464 1.53s-3.675-2.511-4-1.297c-.323 1.214 3.524 1.567 3.287 2.405-.238.839-2.71-1.587-3.216-.642-.506.946 3.49 2.056 3.522 2.064 1.29.33 4.568 1.028 5.713-.624m5.349 0c-.824-1.19-.766-2.082.365-3.194 1.13-1.112 1.789-2.738 1.789-2.738s.246-.945.806-.858.97 1.499-.202 2.362c-1.173.864.233 1.45.685.64.451-.812 1.683-2.896 2.322-3.295s1.089-.175.938.647-2.822 2.813-2.562 3.244 1.176-.506 1.176-.506 2.866-2.567 3.49-1.898-.473 1.23-2.037 2.16c-1.564.932-1.686 1.178-1.464 1.53s3.675-2.511 4-1.297c.323 1.214-3.524 1.567-3.287 2.405.238.839 2.71-1.587 3.216-.642.506.946-3.49 2.056-3.522 2.064-1.29.33-4.568 1.028-5.713-.624'
};

/* which brand mark a contact link gets, by its label, and its brand colour.
   GitHub's mark is the ink itself: black on light, white on dark. */
const BRAND = { GITHUB: 'github', LINKEDIN: 'linkedin', 'HUGGING FACE': 'huggingface' };
const BRAND_KEY = { GITHUB: 'var(--chrome)', LINKEDIN: '#0A66C2', 'HUGGING FACE': '#FFD21E' };
/* the icon palette (Apple system colours, see css), dealt round the rows of
   a category so neighbouring rows never share a colour */
const PALETTE = ['var(--sys-blue)', 'var(--sys-orange)', 'var(--sys-purple)',
                 'var(--sys-green)', 'var(--sys-pink)', 'var(--sys-red)', 'var(--sys-yellow)'];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const host = url => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
};

/* ---------- ABOUT: one intro item, the afaicon is its image ---------- */
const about = {
  id: 'about', label: 'ABOUT', mark: null, svg: ICONS.person, key: 'var(--sys-yellow)',
  items: [{
    id: 'intro', mark: null, svg: ICONS.person, key: 'var(--sys-yellow)',
    title: ABOUT.title, sub: ABOUT.sub, meta: ABOUT.meta, badge: null,
    body: 'Making LLMs behave at Vistiq.AI, Paris. 5+ years turning data science into shipped systems, Amazon to AXA to AI native startups. Masters in Data Science & AI, emlyon 2026.',
    action: null, cards: []
  }]
};

/* ---------- EDUCATION: its own category, right after experience ---------- */
const education = {
  id: 'education', label: 'EDUCATION', mark: null, svg: ICONS.school, key: 'var(--sys-red)',
  items: EDUCATION.map(e => ({
    id: slug(e.school), mark: e.mark, key: 'var(--sys-red)', logo: e.logo,
    title: e.school, sub: 'education', meta: null, badge: null,
    body: e.line,
    action: e.href ? { label: 'verify diploma', href: e.href } : null,
    cards: []
  }))
};

/* ---------- WORK ---------- */
const work = {
  id: 'work', label: 'WORK', mark: null, svg: ICONS.work, key: 'var(--sys-blue)',
  items: WORK.map(j => ({
    id: slug(j.company), mark: j.mark, key: 'var(--sys-blue)', logo: j.logo,
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
  id: 'play', label: 'PLAY', mark: null, svg: ICONS.gamepad, key: 'var(--sys-green)',
  items: PROJECTS.filter(p => p.video || (p.photos && p.photos.length) || p.logo)
    .map((p, i) => ({
    id: slug(p.name), mark: p.mark, key: PALETTE[i % PALETTE.length], logo: p.logo,
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
  id: 'people', label: 'PEOPLE', mark: null, svg: ICONS.group, key: 'var(--sys-purple)',
  items: [{
    id: 'add-yours', mark: '+', key: 'var(--sys-purple)', form: true,
    title: 'ADD YOURS', sub: 'worked with me?', meta: null, badge: null,
    body: 'Worked with me and have something to say? Fill the form. Your recommendation lands in my review queue, and once I approve it, it appears right here with the others.',
    action: null,
    cards: []
  },
  ...PEOPLE.map(p => ({
    id: slug(p.name), mark: p.init, key: 'var(--sys-purple)', logo: p.photo,
    person: true,
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
  id: 'trophies', label: 'TROPHIES', mark: null, svg: ICONS.trophy, key: 'var(--sys-orange)',
  items: CERTS.filter(c => c.logo).map(c => ({
    id: slug(c.name), mark: c.mark, key: 'var(--sys-orange)', logo: c.logo,
    /* a transparent PNG (the AWS hexagon) is its own shape, no box */
    shape: /\.png$/i.test(c.logo),
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
  id: 'contact', label: 'CONTACT', mark: null, svg: ICONS.mail, key: 'var(--sys-pink)',
  items: [
    {
      id: 'email', mark: null, svg: ICONS.mail, key: 'var(--sys-pink)',
      title: 'EMAIL', sub: 'the fastest way', meta: CONTACT.where, badge: null,
      body: CONTACT.email,
      action: { label: `✉ ${CONTACT.email}`, href: `mailto:${CONTACT.email}` },
      cards: []
    },
    ...CONTACT.links.map(l => ({
      id: slug(l.label), mark: null, svg: ICONS[BRAND[l.label]] || null,
      key: BRAND_KEY[l.label] || 'var(--sys-pink)',
      title: l.label, sub: host(l.href), meta: null, badge: null,
      body: null,
      action: { label: `open ${l.label.toLowerCase()}`, href: l.href },
      cards: []
    }))
  ]
};

export const CATEGORIES = [about, work, education, play, people, trophies, contact];
