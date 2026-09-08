"""Asset contracts and real Chrome checks for the shared category renderer."""

import base64
import json
import struct
from collections import Counter
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = "http://localhost:8001/tests/props3d.html"


@pytest.fixture(scope="module")
def browser():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path="/usr/bin/google-chrome-stable",
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
        )
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 480})
    page = context.new_page()
    page.add_init_script("""
      window.glCanvases = new Set();
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const result = getContext.call(this, type, ...args);
        if (result && type.startsWith('webgl')) window.glCanvases.add(this);
        return result;
      };
    """)
    yield page
    context.close()


def loaded(page, count=14):
    page.wait_for_function(
        'count => document.querySelectorAll("[data-renderer=prop]").length === count',
        arg=count,
        timeout=60000,
    )


def pixels(page, selector="canvas"):
    return page.locator(selector).first.evaluate("(canvas) => canvas.toDataURL()")


def screenshot(page, path):
    session = page.context.new_cdp_session(page)
    result = session.send("Page.captureScreenshot", {"format": "webp", "quality": 85})
    path.write_bytes(base64.b64decode(result["data"]))
    session.detach()


def test_asset_contract():
    """Seven props from Tripo at game asset weight, plus the bust cut from the
    avatar. Each is a self contained GLB: textures embedded, no skeleton, no
    animation, and a triangle count that stays in the PS2 range."""
    counts = []
    paths = sorted((ROOT / "assets/props").glob("*.glb"))
    assert [p.stem for p in paths] == sorted(
        ["about", "work", "education", "play", "people", "trophies", "contact"]
    )
    for path in paths:
        blob = path.read_bytes()
        magic, version, length = struct.unpack_from("<III", blob)
        assert (magic, version, length) == (0x46546C67, 2, len(blob))
        data = json.loads(blob[20 : 20 + struct.unpack_from("<I", blob, 12)[0]])
        assert not data.get("skins") and not data.get("animations")
        triangles = 0
        for mesh in data["meshes"]:
            for primitive in mesh["primitives"]:
                assert "TEXCOORD_0" in primitive["attributes"]
                triangles += data["accessors"][primitive["indices"]]["count"] // 3
        assert 2000 <= triangles <= 8000, (path.stem, triangles)
        counts.append(triangles)
        assert all("bufferView" in image for image in data["images"]), path.stem
        assert path.stat().st_size < 300_000, (path.stem, path.stat().st_size)
    assert sum(p.stat().st_size for p in paths) < 1_300_000


def test_shared_renderer_and_fetches(page):
    requests = Counter()
    page.on("request", lambda request: requests.update([request.url.split("/")[-1]]))
    page.goto(URL)
    loaded(page)
    output = ROOT / "updates/category-props"
    output.mkdir(exist_ok=True)
    screenshot(page, output / "set.webp")
    assert page.evaluate("glCanvases.size") == 1
    assert sum(count for name, count in requests.items() if name.endswith(".glb")) == 7
    assert all(count == 1 for name, count in requests.items() if name.endswith(".glb"))
    for canvas in page.locator("canvas").all():
        assert canvas.evaluate("""c => {
          const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          return pixels.filter((value, i) => i % 4 === 3 && value > 0).length > 100;
        }""")


def test_lazy_load_and_group_lifecycle(page):
    page.route(
        "**/tests/props3d.html",
        lambda route: route.fulfill(
            content_type="text/html",
            body='<body><canvas style="width:100px;height:100px"></canvas></body>',
        ),
    )
    requests = []
    page.on("request", lambda request: requests.append(request.url))
    page.goto(URL)
    page.evaluate("async () => { window.props = await import('/js/props3d.js'); }")
    assert not any(url.endswith(".glb") for url in requests)
    assert page.evaluate("glCanvases.size") == 0
    page.evaluate("""() => {
      const c = document.querySelector('canvas'); c.dataset.prop = 'work';
      c.dataset.d = 'M0 0H24V24H0Z';
      props.spin(c, {group:'old',speed:1});
      props.spin(c, {group:'new',speed:0,angle:0.2});
      props.stop('old');
    }""")
    loaded(page, 1)
    still = pixels(page)
    page.wait_for_timeout(150)
    assert pixels(page) == still
    page.evaluate("props.setSpeed(2, 'new')")
    page.wait_for_timeout(150)
    assert pixels(page) != still
    page.evaluate("props.stop('new')")
    stopped = pixels(page)
    page.wait_for_timeout(150)
    assert pixels(page) == stopped


@pytest.mark.parametrize("failure", ["glb", "webgl", "cdn"])
def test_fallback(page, failure):
    if failure == "webgl":
        page.add_init_script("""
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, ...args) {
            return type.startsWith('webgl') ? null : original.call(this, type, ...args);
          };
        """)
    else:
        pattern = {
            "glb": "**/work.glb*",
            "cdn": "**/three.module.min.js",
        }[failure]
        page.route(pattern, lambda route: route.abort())
    page.emulate_media(reduced_motion="reduce")
    page.goto(URL)
    page.wait_for_timeout(2500)
    selector = "canvas[data-prop=work]"
    assert page.locator(selector).first.get_attribute("data-renderer") == "fallback"
    assert page.locator(selector).first.evaluate("""c => c.getContext('2d')
      .getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3 && v>0)""")
    still = pixels(page, selector)
    page.wait_for_timeout(150)
    assert pixels(page, selector) == still


def test_reduced_motion_and_context_loss(page):
    """Reduced motion holds every prop still. Losing the GPU sends every
    canvas to its flat glyph rather than leaving the bar blank."""
    page.emulate_media(reduced_motion="reduce")
    page.goto(URL)
    loaded(page)
    selector = "canvas[data-prop=work]"
    page.evaluate("props.setSpeed(1, 'work')")
    page.wait_for_timeout(100)
    still = pixels(page, selector)
    page.wait_for_timeout(150)
    assert pixels(page, selector) == still
    page.emulate_media(reduced_motion="no-preference")
    page.wait_for_timeout(100)
    moving = pixels(page, selector)
    page.wait_for_timeout(150)
    assert pixels(page, selector) != moving
    page.evaluate(
        "[...glCanvases][0].getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()"
    )
    page.wait_for_function(
        "document.querySelectorAll('[data-renderer=fallback]').length === 14"
    )


@pytest.mark.parametrize("width,height", [(1440, 900), (768, 1024), (390, 844)])
def test_site_screenshots(browser, width, height):
    context = browser.new_context(
        viewport={"width": width, "height": height}, has_touch=width == 390
    )
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://localhost:8001/?skip")
    page.wait_for_function(
        "document.querySelectorAll('[data-renderer=prop]').length >= 7", timeout=60000
    )
    page.wait_for_timeout(2500)
    output = ROOT / "updates/category-props"
    output.mkdir(exist_ok=True)
    screenshot(page, output / f"site-{width}.webp")
    if width == 390:
        row = page.locator(".mob-row").nth(1)
        row.tap()
        row.tap()
        assert page.locator(".mob--page").count() == 1
        page.locator(".mob-back").tap()
        assert page.locator(".mob--page").count() == 0
    else:
        page.keyboard.press("ArrowRight")
        assert page.locator(".cat.is-on canvas").get_attribute("data-prop") == "work"
        page.emulate_media(reduced_motion="reduce")
        page.evaluate("document.body.classList.add('light')")
        page.wait_for_timeout(500)
        assert page.locator(".cat.is-on canvas").is_visible()
        screenshot(page, output / f"site-{width}-light-reduced.webp")
    assert errors == []
    context.close()
