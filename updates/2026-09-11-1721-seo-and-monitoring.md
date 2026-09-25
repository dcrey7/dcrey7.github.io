# SEO metadata and daily monitoring

Recorded: 2026-09-11 17:21 CEST.

## Source and deployment

The current source is:
`/home/abhishek/Downloads/work/portfolio/portfolio-4/.claude/worktrees/ps5-ui`.
The parent `portfolio-4` checkout is an older version. Its GitHub remote also
has the older version. Do not deploy that checkout over this site.

Cloudflare Pages project: `hiabhi`. Production branch: `worktree-ps5-ui`.
It uses direct upload, not the GitHub Pages flow described in the old README.
Previous deployment: `dee357e9-0d92-409f-950b-6b1fca99c830`.
This deployment: `https://41f496bd.hiabhi.pages.dev`.
Public site: `https://hiabhi.com/`.

The user requires the existing design to stay intact. No landing page, hidden
keyword text, or fallback screen is added. The page body, CSS, JavaScript,
content, images, layout and animation remain unchanged. A proposed no-script
fallback was removed before deployment.

## Research and changes

Compared Kicky AI's `docs/wiki/seo-measurement.md` with Tranzlato's
`docs/research/2026-09-11-multilingual-seo-automation.md`. Both have technical
checks and local daily timers. Neither a successful audit nor raw HTTP requests
prove Google traffic or better rankings. The portfolio now uses the same
separation: technical status versus unmeasured organic performance.

The live portfolio had no canonical, profile schema, or valid sitemap.
`/robots.txt` and `/sitemap.xml` returned the homepage with HTTP 200.

- `index.html`: descriptive title, canonical, social metadata, and ProfilePage
  JSON-LD with a Person as mainEntity. Only existing public identity facts.
- `robots.txt`: allow crawling and declare the sitemap.
- `sitemap.xml`: one real canonical page. No invented modification date,
  language variants, or query-string pages.
- `_redirects`: redirect `/index.html` to `/`.
- `scripts/seo_audit.py`: bounded live requests, metadata and schema checks,
  robots and sitemap checks, image validation, canonical/redirect checks,
  dated JSON reports, and nonzero exit on failure.
- `scripts/systemd/hiabhi-seo.{service,timer}`: daily local audit.
- `tests/test_seo.py`, `justfile`, `.gitignore`: checks, commands, private report
  paths and local cache exclusions.

Primary sources:

- [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [ProfilePage schema](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [AI search features](https://developers.google.com/search/docs/appearance/ai-features)
- [Cloudflare direct upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare redirect syntax](https://developers.cloudflare.com/pages/configuration/redirects/)

Google's AI features need the same core SEO foundations. No extra AI landing
page or special AI markup is required by that guidance. Schema does not promise
a rich result. A sitemap helps discovery but does not guarantee indexing.

## Verification

`just check-seo`:

```text
13 passed in 0.06s
technical: pass
issues: []
organic: not_measured
```

Ruff check and format pass. `git diff --check` passes.
The production upload reports `Uploaded 3 files (247 already uploaded)`.
Compared all 248 previous asset hashes before publishing: only `index.html`
changed. New assets are `robots.txt` and `sitemap.xml`. Existing headers stay
intact. Post-deployment comparison confirms the live body, CSS, main script,
data, desktop menu and mobile menu match the unchanged source.

The live audit at 15:20:51 UTC passes with zero issues. One advisory remains:
`www.hiabhi.com` serves the same page with the correct apex canonical; a domain
redirect is still recommended. Cloudflare Pages `_redirects` does not support
domain-level redirects. No zone redirect rule was changed.

The first monitor run failed on the old metadata and invalid crawler files.
A later run found a monitor bug: it treated a noindex header on sitemap XML as
a homepage indexing block. The check now applies to the HTML page; regression
tests cover both cases. The final service reports `Result=success` and
`ExecMainStatus=0`.

The default Python urllib user agent and the immutable deployment URL returned
403 during checks. Browser, Googlebot-user-agent and named-monitor requests to
the custom domain return HTTP 200. This is not proof of access from Google's
actual crawler IPs. No security setting was weakened. The initial
`systemd-analyze --user verify` failed to initialize a manager; plain
`systemd-analyze verify` and the real user service run pass.

## Schedule and reports

Run `just seo-report` for a live report or `just check-seo` for local checks.
Read `results/seo/latest-live.json` for the last live run.
`just seo-monitor-status` shows the timer and last service result.

The installed user timer runs around 09:00 Europe/Paris with up to ten minutes
of delay. The computer and user manager must be running. Persistent mode runs
a missed job when the timer next activates. This is not an always-on cloud job.
No email, posts, messages, content generation, or indexing requests are sent.
Stop it with `systemctl --user disable --now hiabhi-seo.timer`.

## Search Console next step

The user supplied an existing Search Console inspection. Its August 21 crawl
shows `Page with redirect`, no user canonical, and Google-selected canonical
`https://nudgexa-com.l.ink/`. It also shows a temporary sitemap processing error.
This is historical evidence. Current browser and Googlebot-user-agent requests
return HTTP 200 at `https://hiabhi.com/`, with no nudgexa reference.

In the existing property, submit `https://hiabhi.com/sitemap.xml`, run URL
Inspection's live test for `https://hiabhi.com/`, inspect the rendered page,
then request indexing if the live test is eligible. Do not create a duplicate
property or a new landing page. Google chooses when and whether to index.
No authorized Search Console API connection exists in this monitor. The site
still requires JavaScript for its content, so Google's actual rendering needs
verification in that live test. Search traffic and ranking changes are unknown.
