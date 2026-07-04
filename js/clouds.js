/* Fallback backdrop: domain-warped fbm clouds (GLSL1 — runs on WebGL1 or 2).
   Used when the fluid sim can't run (no WebGL2/float FBOs, reduced motion). */
import { palette, lerpPalette, REDUCED, MOBILE } from './config.js';

export function initClouds(canvas, gl){
  const frag = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
  uniform vec3 uCA; uniform vec3 uCB; uniform vec3 uAcc;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.55;
    for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.02 + 17.3; a *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
    float t = uTime * 0.045;
    vec2 q = vec2(fbm(p*1.3 + vec2(t, -t*0.6)),
                  fbm(p*1.3 + vec2(-t*0.4, t*0.8) + 5.2));
    vec2 r = vec2(fbm(p*2.0 + q*2.0 + vec2(1.7, 9.2) + t*0.6),
                  fbm(p*2.0 + q*2.0 + vec2(8.3, 2.8) - t*0.4));
    float f = fbm(p*2.3 + r*2.4 + uMouse*0.2);
    vec3 col = mix(uCA, uCB, clamp(f*f*2.4, 0.0, 1.0));
    col = mix(col, uAcc, clamp(pow(r.y, 3.0), 0.0, 1.0) * 0.7);
    float d = length(p - uMouse*0.35);
    col += uAcc * 0.3 * exp(-d*d*2.2);
    col *= 1.0 - 0.4*smoothstep(0.45, 1.05, length(uv - 0.5));
    col += (hash(gl_FragCoord.xy + fract(uTime)*61.0) - 0.5) * 0.045;
    gl_FragColor = vec4(col, 1.0);
  }`;
  const vert = 'attribute vec2 aP; void main(){ gl_Position = vec4(aP, 0.0, 1.0); }';

  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  };
  let prog, U = {};
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog); gl.useProgram(prog);
  } catch(e){ console.warn('clouds disabled:', e); return false; }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(prog, 'aP');
  gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  ['uRes','uTime','uMouse','uCA','uCB','uAcc'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  const mouse = { x:0, y:0, tx:0, ty:0 };
  addEventListener('pointermove', e => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, {passive:true});

  const t0 = performance.now();
  function frame(now){
    requestAnimationFrame(frame);
    lerpPalette();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, REDUCED ? 40.0 : (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform3fv(U.uCA, palette.cur[0]);
    gl.uniform3fv(U.uCB, palette.cur[1]);
    gl.uniform3fv(U.uAcc, palette.cur[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
  return true;
}
