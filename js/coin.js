/* 3D afaicon collectible coin (three.js). Flips on section change;
   its point light is tinted live by the scene palette. */
import { palette, bus, REDUCED } from './config.js';

export async function initCoin(){
  const THREE = await import('three');

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2));
  renderer.domElement.id = 'coin';
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  cam.position.z = 7;

  const tex = await new THREE.TextureLoader().loadAsync('assets/afaicon.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.center.set(0.5, 0.5);
  tex.rotation = Math.PI / 2;

  const rim = new THREE.MeshStandardMaterial({ color: 0xd8a917, metalness: 0.95, roughness: 0.28 });
  const face = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.15, roughness: 0.5 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.14, 72), [rim, face, face]);
  coin.rotation.x = Math.PI / 2;
  const rig = new THREE.Group();
  rig.add(coin);
  scene.add(rig);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 6);
  scene.add(key);
  const glow = new THREE.PointLight(0xffc805, 12, 30);
  glow.position.set(-3, -2, 4);
  scene.add(glow);

  function fit(){
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    const portrait = cam.aspect < 0.9;
    rig.position.set(portrait ? 0.55 : 2.6 * Math.min(cam.aspect / 1.6, 1.4),
                     portrait ? 1.95 : 0.15, 0);
    const s = portrait ? 0.72 : 1.0;
    rig.scale.set(s, s, s);
  }
  addEventListener('resize', fit); fit();

  let flipAt = -10;
  bus.addEventListener('nav', () => { flipAt = performance.now() / 1000; });
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  }, {passive:true});

  renderer.setAnimationLoop(now => {
    const t = now / 1000;
    if(!REDUCED){
      rig.rotation.y = t * 0.55;
      const k = Math.min((t - flipAt) / 0.9, 1);
      if(k > 0 && k < 1) rig.rotation.y += easeOut(k) * Math.PI * 2;
      rig.position.y += Math.sin(t * 1.3) * 0.0016;
      rig.rotation.z = Math.sin(t * 0.5) * 0.07 + mouse.x * 0.08;
      rig.rotation.x = mouse.y * 0.12;
    }
    const c = palette.cur[2];
    glow.color.setRGB(Math.min(c[0]*1.2, 1), Math.min(c[1]*1.2, 1), Math.min(c[2]*1.2, 1));
    renderer.render(scene, cam);
  });
}
