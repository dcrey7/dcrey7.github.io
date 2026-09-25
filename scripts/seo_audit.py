"""Check the public SEO contract. Never infer search traffic from HTTP checks."""

import argparse
import json
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://hiabhi.com"
CARD = "/assets/og-card.png"
PRODUCTS = (
    "rezoume.com",
    "tranzlato.com",
    "kickyai.com",
    "recolli.com",
)  # the 1200 x 630 share card
LIMIT = 2_000_000


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.meta = {}
        self.canonicals = []
        self.title = ""
        self.schemas = []
        self.capture = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))] = attrs.get(
                "content", ""
            )
        if tag == "link" and "canonical" in attrs.get("rel", "").split():
            self.canonicals.append(attrs.get("href", ""))
        if tag == "title":
            self.capture = "title"
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.capture = "schema"
            self.schemas.append("")

    def handle_data(self, data):
        if self.capture == "title":
            self.title += data
        elif self.capture == "schema":
            self.schemas[-1] += data

    def handle_endtag(self, tag):
        if tag in {"title", "script"}:
            self.capture = None


def check_page(source):
    page = Page(source)
    issues = []
    if "Abhishek Thomas" not in page.title or "AI Engineer" not in page.title:
        issues.append("Title must identify Abhishek Thomas and his role")
    if page.canonicals != [ORIGIN + "/"]:
        issues.append("Expected one canonical URL: https://hiabhi.com/")
    for field in ("description", "og:title", "og:description", "og:image:alt"):
        if not page.meta.get(field, "").strip():
            issues.append(f"Missing metadata: {field}")
    for field, value in {
        "og:url": ORIGIN + "/",
        "og:type": "website",
        "og:image": ORIGIN + CARD,
        "og:image:width": "1200",
        "og:image:height": "630",
        "twitter:image": ORIGIN + CARD,
        "twitter:card": "summary_large_image",
    }.items():
        if page.meta.get(field) != value:
            issues.append(f"Unexpected or missing metadata: {field}")
    for name in ("robots", "googlebot", "bingbot"):
        tokens = page.meta.get(name, "").lower().replace(",", " ").split()
        if {"noindex", "none"}.intersection(tokens):
            issues.append(f"Indexing blocked by {name} metadata")
    try:
        schemas = [json.loads(value) for value in page.schemas]
        # One block may hold a @graph of linked nodes; flatten it.
        nodes = []
        for value in schemas:
            if (
                not isinstance(value, dict)
                or value.get("@context") != "https://schema.org"
            ):
                raise ValueError("Every block needs the schema.org context")
            nodes.extend(value.get("@graph", [value]))
        by_id = {node.get("@id"): node for node in nodes if isinstance(node, dict)}
        profiles = [
            node
            for node in nodes
            if isinstance(node, dict) and node.get("@type") == "ProfilePage"
        ]
        if len(profiles) != 1:
            raise ValueError("Expected one ProfilePage")
        profile = profiles[0]
        person = profile.get("mainEntity", {})
        if isinstance(person, dict) and set(person) == {"@id"}:
            person = by_id.get(person["@id"], {})
        if (
            profile.get("url") != ORIGIN + "/"
            or not isinstance(person, dict)
            or person.get("@type") != "Person"
            or person.get("name") != "Abhishek Thomas"
        ):
            raise ValueError("Profile must describe Abhishek Thomas")
    except (ValueError, TypeError) as error:
        issues.append(f"Invalid profile schema: {error}")
    return issues


def check_llms(source):
    if "<html" in source.lower() or "<!doctype" in source.lower():
        return ["llms.txt returns HTML"]
    issues = []
    if not source.startswith("# Abhishek Thomas"):
        issues.append("llms.txt must open with his name as the title")
    if ORIGIN + "/" not in source:
        issues.append("llms.txt must link the site")
    issues.extend(
        f"llms.txt must name {product}" for product in PRODUCTS if product not in source
    )
    return issues


def check_robots(source):
    if "<html" in source.lower() or "<!doctype" in source.lower():
        return ["robots.txt returns HTML"]
    parser = RobotFileParser()
    parser.parse(source.splitlines())
    issues = []
    for agent in ("*", "Googlebot", "Bingbot"):
        for path in ("/", "/js/main.js", "/css/main.css", "/assets/afaicon.png"):
            if not parser.can_fetch(agent, ORIGIN + path):
                issues.append(f"robots.txt blocks {agent} from {path}")
    if ORIGIN + "/sitemap.xml" not in (parser.site_maps() or []):
        issues.append("robots.txt does not declare the canonical sitemap")
    return issues


def check_sitemap(source):
    try:
        root = ElementTree.fromstring(source)
    except ElementTree.ParseError as error:
        return [f"Invalid sitemap XML: {error}"]
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    urls = [node.text for node in root.findall(f"{ns}url/{ns}loc")]
    if root.tag != ns + "urlset" or urls != [ORIGIN + "/"]:
        return ["Sitemap must contain the single canonical homepage"]
    return []


def fetch(url):
    request = Request(url, headers={"User-Agent": "HiAbhi-SEO-Monitor/1.0"})
    with urlopen(request, timeout=20) as response:
        body = response.read(LIMIT + 1)
        if len(body) > LIMIT:
            raise ValueError("Response exceeds 2 MB limit")
        if response.status != 200:
            raise ValueError(f"Unexpected HTTP status: {response.status}")
        return body, response.headers, response.url


def audit(local=False):
    issues = []
    warnings = []
    for path, validator, media in (
        ("index.html", check_page, "text/html"),
        ("robots.txt", check_robots, "text/plain"),
        ("sitemap.xml", check_sitemap, "xml"),
        ("llms.txt", check_llms, "text/plain"),
    ):
        try:
            if local:
                source = (ROOT / path).read_text()
            else:
                url = ORIGIN + ("/" if path == "index.html" else "/" + path)
                body, headers, final = fetch(url)
                source = body.decode("utf-8")
                if final != url:
                    issues.append(f"{path}: unexpected redirect to {final}")
                if media not in headers.get("Content-Type", "").lower():
                    issues.append(f"{path}: wrong Content-Type")
                directives = headers.get("X-Robots-Tag", "").lower()
                # A sitemap need not appear in search results to be processed.
                if path == "index.html" and (
                    "noindex" in directives or "none" in directives
                ):
                    issues.append(f"{path}: X-Robots-Tag blocks indexing")
            issues.extend(f"{path}: {issue}" for issue in validator(source))
        except (OSError, URLError, ValueError) as error:
            issues.append(f"{path}: {error}")
    try:
        if local:
            image = (ROOT / CARD.lstrip("/")).read_bytes()
        else:
            image, headers, final = fetch(ORIGIN + CARD)
            if headers.get_content_type() != "image/png":
                issues.append("Social image does not return image/png")
        if not image.startswith(b"\x89PNG\r\n\x1a\n"):
            issues.append("Social image is not a PNG")
    except (OSError, URLError, ValueError) as error:
        issues.append(f"Social image: {error}")
    if not local:
        for url in ("http://hiabhi.com/", "https://www.hiabhi.com/"):
            try:
                body, _, final = fetch(url)
                if final != ORIGIN + "/":
                    if url.startswith("https://www.") and not check_page(
                        body.decode("utf-8")
                    ):
                        warnings.append(
                            "www serves the same page with the correct canonical; a Cloudflare domain redirect is still recommended"
                        )
                    else:
                        issues.append(
                            f"{url} must redirect to {ORIGIN}/ or declare its canonical"
                        )
            except (OSError, URLError, ValueError) as error:
                issues.append(f"{url}: {error}")
    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "target": "local files" if local else ORIGIN,
        "technical": "fail" if issues else "pass",
        "issues": issues,
        "warnings": warnings,
        "organic": "not_measured",
        "limitations": [
            "Search Console is not connected. Rankings and traffic are unknown.",
            "Checks do not prove Google indexing or rich-result eligibility.",
            "The interactive content requires JavaScript rendering.",
            "Local checks do not validate hosting redirects or response headers.",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "results/seo")
    args = parser.parse_args()
    report = audit(local=args.local)
    output = json.dumps(report, indent=2) + "\n"
    args.output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M%S-%f")
    mode = "local" if args.local else "live"
    (args.output_dir / f"{stamp}-{mode}.json").write_text(output)
    (args.output_dir / f"latest-{mode}.json").write_text(output)
    print(output, end="")
    return int(report["technical"] != "pass")


if __name__ == "__main__":
    sys.exit(main())
