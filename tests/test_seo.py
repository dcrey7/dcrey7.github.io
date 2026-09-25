"""Catch crawl regressions and reports that hide live failures."""

import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.error import URLError

import pytest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "seo_audit", ROOT / "scripts/seo_audit.py"
)
seo = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(seo)


def test_local_contract():
    report = seo.audit(local=True)
    assert report["issues"] == []
    assert report["technical"] == "pass"
    assert report["organic"] == "not_measured"


@pytest.mark.parametrize(
    "replacement", ["", '<link rel="canonical" href="https://dcrey7.github.io/">']
)
def test_missing_or_old_canonical(replacement):
    source = (
        (ROOT / "index.html")
        .read_text()
        .replace('<link rel="canonical" href="https://hiabhi.com/">', replacement)
    )
    assert any("canonical" in issue for issue in seo.check_page(source))


def test_invalid_schema_and_noindex():
    source = (ROOT / "index.html").read_text().replace(
        '"@type": "ProfilePage"', '"@type": invalid'
    ) + '<meta name="robots" content="noindex, follow">'
    issues = seo.check_page(source)
    assert any("schema" in issue for issue in issues)
    assert any("blocked" in issue for issue in issues)


def test_spa_fallback_is_not_robots_or_sitemap():
    source = (ROOT / "index.html").read_text()
    assert seo.check_robots(source)
    assert seo.check_sitemap(source)


def test_spa_fallback_is_not_llms():
    # Pages answers every unknown path with the homepage. That must fail.
    assert seo.check_llms((ROOT / "index.html").read_text())
    assert seo.check_llms((ROOT / "llms.txt").read_text()) == []


def test_profile_person_resolves_through_graph():
    # The ProfilePage points at the Person by @id; a broken id must fail.
    source = (
        (ROOT / "index.html")
        .read_text()
        .replace(
            '"@id": "https://hiabhi.com/#person",',
            '"@id": "https://hiabhi.com/#other",',
            1,
        )
    )
    assert any("schema" in issue for issue in seo.check_page(source))


def test_small_card_is_rejected():
    source = (
        (ROOT / "index.html")
        .read_text()
        .replace('content="summary_large_image"', 'content="summary"')
    )
    assert any("twitter:card" in issue for issue in seo.check_page(source))


def test_robots_disallows_google():
    source = (
        "User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /\n"
        "Sitemap: https://hiabhi.com/sitemap.xml\n"
    )
    assert any("blocks Googlebot" in issue for issue in seo.check_robots(source))


def test_sitemap_rejects_old_domain():
    source = (
        (ROOT / "sitemap.xml").read_text().replace("hiabhi.com", "dcrey7.github.io")
    )
    assert seo.check_sitemap(source)


def test_network_failure_is_reported(monkeypatch):
    def fail(url):
        raise URLError("test network unavailable")

    monkeypatch.setattr(seo, "fetch", fail)
    report = seo.audit()
    assert report["technical"] == "fail"
    assert len(report["issues"]) == 7  # page, robots, sitemap, llms, card, http, www
    assert report["organic"] == "not_measured"


def test_cli_saves_local_report(tmp_path):
    result = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/seo_audit.py"),
            "--local",
            "--output-dir",
            str(tmp_path),
        ],
        capture_output=True,
        text=True,
        check=False,  # the assert below reports stderr on failure
    )
    assert result.returncode == 0, result.stderr
    report = json.loads((tmp_path / "latest-local.json").read_text())
    assert report["technical"] == "pass"
    assert not (tmp_path / "latest-live.json").exists()


def test_cli_failure_returns_nonzero_and_saves_report(monkeypatch, tmp_path):
    monkeypatch.setattr(sys, "argv", ["seo_audit", "--output-dir", str(tmp_path)])
    monkeypatch.setattr(
        seo, "audit", lambda **kwargs: {"technical": "fail", "issues": ["offline"]}
    )
    assert seo.main() == 1
    assert json.loads((tmp_path / "latest-live.json").read_text())["issues"] == [
        "offline"
    ]


@pytest.mark.parametrize("noindex_path", [None, "sitemap.xml", "index.html"])
def test_www_canonical_and_indexing_headers(monkeypatch, noindex_path):
    from email.message import Message

    def response(url):
        name = url.removeprefix(seo.ORIGIN + "/")
        if url in (seo.ORIGIN + "/", "https://www.hiabhi.com/", "http://hiabhi.com/"):
            name = "index.html"
        types = {
            "index.html": "text/html",
            "robots.txt": "text/plain",
            "sitemap.xml": "application/xml",
            "assets/og-card.png": "image/png",
            "llms.txt": "text/plain",
        }
        headers = Message()
        headers["Content-Type"] = types[name]
        if name == noindex_path:
            headers["X-Robots-Tag"] = "noindex"
        final = seo.ORIGIN + "/" if url.startswith("http:") else url
        return (ROOT / name).read_bytes(), headers, final

    monkeypatch.setattr(seo, "fetch", response)
    report = seo.audit()
    assert report["technical"] == ("fail" if noindex_path == "index.html" else "pass")
    assert len(report["warnings"]) == 1


NOSCRIPT_SPEC = importlib.util.spec_from_file_location(
    "noscript", ROOT / "scripts/noscript.py"
)
noscript = importlib.util.module_from_spec(NOSCRIPT_SPEC)
NOSCRIPT_SPEC.loader.exec_module(noscript)


def test_noscript_block_matches_llms_txt():
    # llms.txt is the one source; run scripts/noscript.py after editing it.
    assert noscript.block() in (ROOT / "index.html").read_text()


def test_page_has_real_text_without_javascript():
    source = (ROOT / "index.html").read_text()
    inner = source[source.index("<noscript>\n<article") : source.index("</article>")]
    words = re.sub(r"<[^>]+>", " ", inner).split()
    assert len(words) > 300
    for fact in ("Abhishek Thomas", "Vistiq.AI", "emlyon", "rezoume", "tranzlato"):
        assert fact in inner


def test_www_function_redirects_only_www():
    source = (ROOT / "functions/index.ts").read_text()
    assert '"www.hiabhi.com"' in source and "301" in source and "next()" in source
    routes = json.loads((ROOT / "_routes.json").read_text())
    assert routes["include"] == ["/"]  # the function never touches assets
