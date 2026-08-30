/* The chrome mark, live in WebGL.

   The same recipe as the Blender render, drawn fresh every frame so the
   turn is as smooth as the screen: the traced outline becomes shapes, the
   shapes are extruded with a rounded bevel, the material is a mirror
   metal, and a studio panorama is what it reflects (image based lighting,
   the way real time engines do chrome). three.js from cdnjs, nothing
   else. The path uses only M, L, C and Z, so it is parsed here instead
   of with the SVG loader addon. */

const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.170.0/three.module.min.js';

/* M x y | L x y | C x1 y1 x2 y2 x y | Z, space separated numbers */
function pathToShapes(THREE, d) {
  const sp = new THREE.ShapePath();
  const re = /([MLCZ])([^MLCZ]*)/g;
  let m;
  while ((m = re.exec(d))) {
    const n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    switch (m[1]) {
      case 'M': sp.moveTo(n[0], -n[1]); break;
      case 'L': for (let i = 0; i < n.length; i += 2) sp.lineTo(n[i], -n[i + 1]); break;
      case 'C': for (let i = 0; i < n.length; i += 6)
        sp.bezierCurveTo(n[i], -n[i + 1], n[i + 2], -n[i + 3], n[i + 4], -n[i + 5]); break;
      case 'Z': if (sp.currentPath) sp.currentPath.closePath(); break;
    }
  }
  return sp.toShapes(false);
}

/* a mottled roughness map (the tutorial's noise into roughness): the face
   averages a small cone of the panorama instead of mirroring one point,
   so it can never go flat black when it faces the camera */
function noiseTexture(THREE, size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  const img = x.createImageData(size, size);
  const d = img.data;
  /* value noise: a few octaves of smooth random */
  const grid = n => { const g = new Float32Array(n * n); for (let i = 0; i < g.length; i++) g[i] = Math.random(); return g; };
  const sample = (g, n, u, v) => {
    const fx = u * n, fy = v * n, x0 = Math.floor(fx) % n, y0 = Math.floor(fy) % n;
    const x1 = (x0 + 1) % n, y1 = (y0 + 1) % n, tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[y0 * n + x0], b = g[y0 * n + x1], cc = g[y1 * n + x0], dd = g[y1 * n + x1];
    return (a + (b - a) * sx) * (1 - sy) + (cc + (dd - cc) * sx) * sy;
  };
  /* six octaves, large to fine, so nothing repeats or lines up */
  const octs = [[grid(5), 5, 1], [grid(11), 11, .6], [grid(23), 23, .35],
                [grid(47), 47, .2], [grid(97), 97, .12], [grid(199), 199, .07]];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    let v = 0, w = 0;
    for (const [g, n, amp] of octs) { v += sample(g, n, i / size, j / size) * amp; w += amp; }
    const k = Math.round((v / w) * 255);
    const o = (j * size + i) * 4;
    d[o] = d[o + 1] = d[o + 2] = k; d[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  /* light wear: thin random scratches, a few directions, most of them
     faint, drawn over the noise so they read in the reflections */
  for (let i = 0; i < 260; i++) {
    const len = 40 + Math.random() * 260, ang = Math.random() * Math.PI;
    const sx = Math.random() * size, sy = Math.random() * size;
    x.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
    x.lineWidth = 0.6 + Math.random() * 1.4;
    x.beginPath();
    x.moveTo(sx, sy);
    x.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  /* the extrusion maps textures in model units (the mark is 24 wide),
     so stretch the texture ONCE over the whole mark: no tiling, no
     visible pattern */
  t.repeat.set(1 / 26, 1 / 26);
  t.offset.set(0.5, 0.5);
  return t;
}

/* mount the mark on `canvas`. Returns { setSpeed, setAngle, stop } or throws. */
export async function chromeMark(canvas, pathD, envUrl) {
  const THREE = await import(THREE_URL);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  /* a perspective camera: the reflection direction changes across the
     face, which is what gives chrome its sweep (orthographic = flat) */
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 400);
  camera.position.set(0, 0, 54);
  camera.lookAt(0, 0, 0);

  /* the reflections: a studio panorama as image based lighting */
  const env = await new Promise((res, rej) =>
    new THREE.TextureLoader().load(envUrl, res, undefined, rej));
  env.mapping = THREE.EquirectangularReflectionMapping;
  env.colorSpace = THREE.SRGBColorSpace;
  /* prefilter the panorama once (PMREM): every roughness level gets a
     properly blurred copy, which is what stops the sparkle a mirror
     surface makes when it samples a sharp image through tiny facets */
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromEquirectangular(env).texture;
  /* turn the studio so the white sweep sits behind the camera: the face
     reflects light, not the dark back wall, at 0° and at 180° */
  if (scene.environmentRotation) scene.environmentRotation.set(0, Math.PI, 0);
  env.dispose();
  pmrem.dispose();

  /* the extrusion: depth and a rounded bevel, in the 24 unit grid */
  const shapes = pathToShapes(THREE, pathD);
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 1.8, bevelEnabled: true, bevelThickness: 0.32, bevelSize: 0.28,
    bevelSegments: 8, curveSegments: 16
  });
  geo.center();
  const rough = noiseTexture(THREE);
  const mat = new THREE.MeshPhysicalMaterial({
    /* a light, random variation in roughness (the map scales the value)
       and a faint waviness (the same noise as a bump): plated chrome,
       never a flat black face, no pattern, no sparkle */
    /* SILVER chrome: a neutral metal, the reflections stay uncoloured */
    color: 0xdde0e5, metalness: 1, roughness: 0.32, roughnessMap: rough,
    bumpMap: rough, bumpScale: 0.1, envMapIntensity: 1.15
  });
  const mesh = new THREE.Mesh(geo, mat);
  /* eye level: the camera and the mark's horizon on one line, no tilt */
  scene.add(mesh);
  /* a debug hook: ?mark=<degrees> holds the mark at that angle */
  const held = new URLSearchParams(location.search).get('mark');

  let speed = held !== null ? 0 : 1, raf = 0, last = 0, alive = true;
  if (held !== null) mesh.rotation.y = Number(held) * Math.PI / 180;
  const TURN = 7;   /* seconds per full turn at speed 1 */
  function frame(now) {
    if (!alive || !canvas.isConnected) return;
    const dt = last ? Math.min(now - last, 50) : 0;
    last = now;
    mesh.rotation.y += (dt / 1000 / TURN) * Math.PI * 2 * speed;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setSpeed(mult) { speed = mult; },
    setAngle(rad) { mesh.rotation.y = rad; },
    stop() { alive = false; if (raf) cancelAnimationFrame(raf); renderer.dispose(); }
  };
}
