# Google indexing confirmed; sitemap report still unresolved

Recorded: 2026-09-11 17:26 CEST.

The user supplied two Search Console results after deployment:

- Live URL test at 17:22: URL available to Google, page can be indexed,
  one valid ProfilePage item.
- URL Inspection: URL is on Google, page is indexed, HTTPS confirmed.

This confirms homepage indexing from the user's Search Console evidence.
It does not establish ranking, impressions, clicks, or traffic growth.

The sitemap report still says `Sitemap is HTML`, line 2, tag `html`, after
resubmission. Do not claim that issue is resolved or that it is certainly a
cached report. Ordinary and Googlebot-user-agent requests from this machine
both return HTTP 200, application/xml, and the correct 154-byte XML file.
The report and these observations disagree. Google's own live test on
`https://hiabhi.com/sitemap.xml` is the next useful evidence. The homepage
inspection does not test the sitemap fetch.

Cloudflare inspection confirms the apex points to hiabhi.pages.dev. No Worker
routes, page rules, or custom redirect/cache rulesets were returned. Managed
security rules were not changed. A targeted purge of robots.txt and sitemap.xml
was attempted but returned HTTP 401 Unauthorized. No purge is claimed.

`just seo-report` at 15:26:44 UTC passes with zero issues and the existing www
redirect advisory. No website files or design were changed in this follow-up.
No new sitemap URL or repeated homepage indexing request is needed without
further evidence. Google documents live URL inspection as a sitemap-fetch
diagnostic: https://support.google.com/webmasters/answer/7451001?hl=en.
