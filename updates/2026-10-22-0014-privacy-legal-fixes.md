---
title: Privacy and legal fixes for hiabhi.com
date: 2026-10-22 00:14 CEST
author: Claude Code (for Abhishek Thomas)
type: update
status: done
---

# Privacy and legal fixes for hiabhi.com

Branch `fix/privacy-2026-10-22`, cut from `worktree-ps5-ui` at 96b7eb3.
The `ps5-ui` worktree was clean, so no snapshot commit was needed.

## What changed

1. **Radio.** Nothing loads from YouTube on page load. The first press of
   play, previous, next or the disc loads the YouTube script. The player
   uses `youtube-nocookie.com` and shows in a visible 200 x 200 card in
   the bottom right corner (phone: under the pill), with the note "Plays
   via YouTube (Google)" and a CLOSE button (pause and hide). Before the
   click, the pill title reads "Plays via YouTube (Google)".
2. **Demo videos.** Same rule: a plain box with a play button and the same
   note. The click swaps in the nocookie player (`js/ytclick.js`).
3. **Fonts.** Anton and Archivo are self-hosted in `assets/fonts/` with
   their OFL licence files. `css/fonts.css` replaces Google Fonts. The
   space theme no longer links Pixelify Sans (its panels are hidden).
4. **Legal page.** `/legal/` holds the legal notice (LCEN art. 1-1-II,
   non professional publisher) and the privacy notice, English then
   French. `/legal` and `/mentions-legales` redirect to it. Link: CONTACT
   category, last item LEGAL (desktop and phone), and llms.txt/noscript.
5. **Reviews.** `tzahyhzkxhedcuobalkr.supabase.co` gives NXDOMAIN (checked
   with `dig` against the local resolver and 1.1.1.1 on 2026-10-22). The
   form is off (`SUPA.open = false`); ADD YOURS now offers email instead.
   The URL and anon key are removed from `js/data.js`.
6. **Testimonials.** Each person shows "Recommendations from LinkedIn,
   shown unedited." No quote was changed.
7. **Clean output.** `just build` copies only public files into `dist/`;
   `just deploy` deploys `dist/`. A `404.html` ends the SPA fallback, so
   unknown paths (and `/updates/`, `/README.md`, ...) now return 404.
8. **CSP.** Removed Google Translate, Google Fonts, gstatic, google.com,
   Supabase, Cloudflare Insights and the `www.youtube.com` frame. Kept
   cdnjs, the YouTube script hosts and `i.ytimg.com` (on click only),
   and `www.youtube-nocookie.com` frames.
9. **/privacy** (YouTube OAuth app): adds the Google Limited Use statement
   and lists the one scope, `yt-analytics.readonly` (from
   `~/Downloads/work/youtubing/scripts/pull.py`).
10. **Alt text.** Person photos ("Photo of ..."), logos ("... logo"),
    badges, project photos and afaicon now carry alt text (desktop and
    phone).

`supabase/schema.sql` is rewritten for a future project: anon can only
insert pending rows, the public reads a view without the `contact` column,
the photo bucket is private (pending photos cannot be listed or read),
size and type limits, and a note on Turnstile or CAPTCHA plus rate limits.

## What the owner must do

- **Reviews:** restore or recreate the Supabase project, run the new
  `supabase/schema.sql`, add Turnstile, put the URL and key in
  `js/data.js`, set `open: true`, and add the project URL to `connect-src`
  and `img-src` in `_headers`. The keepalive worker in `tools/keepalive/`
  points at the dead project; it was not deployed or changed.
- **Analytics:** no Cloudflare Web Analytics beacon was in the live HTML,
  so its CSP entry was removed. If you switch it on, add
  `https://static.cloudflareinsights.com` to `script-src` and
  `https://cloudflareinsights.com` to `connect-src`, and update /legal.
- **Testimonial check:** Olivier Taugourdeau's quote starts "Thomas worked
  on ...". It is shown unedited as asked.
- **Not touched (owner decision):** the Flume theme track and the avatar
  animations under `assets/avatar/play`.

## Verification

- Local `wrangler pages dev dist`: `/` 200, `/legal/` 200, `/privacy/` 200,
  `/mentions-legales` 301 to `/legal/#fr`, `/updates/`, `/README.md`,
  `/justfile`, `/functions/index.ts`, `/assets/links.txt` all 404.
- Playwright, 1440x900 and 390x844: no request to any YouTube or Google
  host before a click, while walking every category and item; only
  outside host was `cdnjs.cloudflare.com`. After play: the player state is
  1 (playing) in the visible card; CLOSE pauses (state 2) and hides it.
  Demo video click loads `youtube-nocookie.com/embed/...`. 0 console
  errors. No horizontal scroll on the phone.
- `tests/interaction.html`: 64/67, the same 3 failures as the unchanged
  branch (the test still expects "MEMORY BRIDGEAI", renamed to Recolli).
- `tests/test_seo.py`: 19 passed.

## Changelog

- 2026-10-22 00:14 CEST: created.
