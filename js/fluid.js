/* Interactive stable-fluids backdrop (WebGL2 + float FBOs).
   Cursor injects force + scene-colored dye; two lissajous stirrers keep it
   alive; section changes throw an ink burst. Returns false if unsupported. */
import { palette, lerpPalette, bus, MOBILE } from './config.js';

export function initFluid(canvas, gl){
  if(!(window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext)) return false;
  if(!gl.getExtension('EXT_color_buffer_float')) return false;

  const VS = `#version 300 es
  layout(location=0) in vec2 aP; out vec2 vUv;
  void main(){ vUv = aP*0.5+0.5; gl_Position = vec4(aP,0.,1.); }`;

  const FS = {
    advect: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uVel, uSrc; uniform vec2 uTexel; uniform float uDt, uDiss;
    void main(){
      vec2 coord = vUv - uDt * texture(uVel, vUv).xy * uTexel;
      o = vec4(uDiss * texture(uSrc, coord).xyz, 1.0);
    }`,
    splat: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uTarget; uniform float uAspect, uRadius; uniform vec3 uColor; uniform vec2 uPoint;
    void main(){
      vec2 p = vUv - uPoint; p.x *= uAspect;
      o = vec4(texture(uTarget, vUv).xyz + uColor * exp(-dot(p,p)/uRadius), 1.0);
    }`,
    diverge: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uVel; uniform vec2 uTexel;
    void main(){
      float L = texture(uVel, vUv - vec2(uTexel.x,0.)).x;
      float R = texture(uVel, vUv + vec2(uTexel.x,0.)).x;
      float B = texture(uVel, vUv - vec2(0.,uTexel.y)).y;
      float T = texture(uVel, vUv + vec2(0.,uTexel.y)).y;
      o = vec4(0.5*(R-L+T-B), 0., 0., 1.);
    }`,
    pressure: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uPre, uDiv; uniform vec2 uTexel;
    void main(){
      float L = texture(uPre, vUv - vec2(uTexel.x,0.)).x;
      float R = texture(uPre, vUv + vec2(uTexel.x,0.)).x;
      float B = texture(uPre, vUv - vec2(0.,uTexel.y)).x;
      float T = texture(uPre, vUv + vec2(0.,uTexel.y)).x;
      o = vec4((L+R+B+T - texture(uDiv, vUv).x) * 0.25, 0., 0., 1.);
    }`,
    gradsub: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uPre, uVel; uniform vec2 uTexel;
    void main(){
      float L = texture(uPre, vUv - vec2(uTexel.x,0.)).x;
      float R = texture(uPre, vUv + vec2(uTexel.x,0.)).x;
      float B = texture(uPre, vUv - vec2(0.,uTexel.y)).x;
      float T = texture(uPre, vUv + vec2(0.,uTexel.y)).x;
      o = vec4(texture(uVel, vUv).xy - 0.5*vec2(R-L, T-B), 0., 1.);
    }`,
    show: `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o;
    uniform sampler2D uDye; uniform vec3 uCA, uCB, uAcc;
    uniform vec2 uPoint; uniform float uAspect, uTime;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    void main(){
      vec3 bg = mix(uCA, uCB*0.45, smoothstep(0.0, 1.0, vUv.y*0.75 + 0.2*sin(uTime*0.1 + vUv.x*2.7)));
      vec3 col = bg + texture(uDye, vUv).rgb;
      vec2 d = vUv - uPoint; d.x *= uAspect;
      col += uAcc * 0.2 * exp(-dot(d,d)*70.0);
      col *= 1.0 - 0.36*smoothstep(0.5, 1.12, length(vUv - 0.5));
      col += (hash(gl_FragCoord.xy + fract(uTime)*61.0) - 0.5) * 0.04;
      o = vec4(col, 1.0);
    }`
  };

  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s);
    return s;
  };
  let P;
  try {
    const vs = compile(gl.VERTEX_SHADER, VS);
    P = {};
    for(const k in FS){
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FS[k]));
      gl.linkProgram(p);
      if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw gl.getProgramInfoLog(p);
      const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for(let i = 0; i < n; i++){ const inf = gl.getActiveUniform(p, i); u[inf.name] = gl.getUniformLocation(p, inf.name); }
      P[k] = { p, u };
    }
  } catch(e){ console.warn('fluid disabled:', e); return false; }

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const mkFbo = (w, h) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { t, f, w, h };
  };
  const mkPair = (w, h) => {
    let a = mkFbo(w, h), b = mkFbo(w, h);
    return { get r(){ return a; }, get w(){ return b; }, swap(){ const t = a; a = b; b = t; } };
  };

  let vel, dye, prs, dvg, texel, aspect;
  const initSim = () => {
    aspect = innerWidth / innerHeight;
    const m = MOBILE();
    const sw = m ? 112 : 160, sh = Math.max(64, Math.round(sw / aspect));
    const dw = m ? 320 : 640, dh = Math.max(128, Math.round(dw / aspect));
    vel = mkPair(sw, sh); prs = mkPair(sw, sh); dvg = mkFbo(sw, sh); dye = mkPair(dw, dh);
    texel = [1/sw, 1/sh];
  };
  initSim();
  let rsT; addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(initSim, 250); });

  function pass(prog, target, uniforms){
    gl.useProgram(prog.p);
    let unit = 0;
    for(const k in uniforms){
      const v = uniforms[k], loc = prog.u[k];
      if(loc == null) continue;
      if(typeof v === 'number') gl.uniform1f(loc, v);
      else if(v.tex){ gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(loc, unit++); }
      else if(v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else gl.uniform3f(loc, v[0], v[1], v[2]);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null);
    gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const FORCE = 5200, VRAD = 0.0028, DRAD = 0.0034;
  const splatVel = (x, y, fx, fy) => {
    pass(P.splat, vel.w, { uTarget:{tex:vel.r.t}, uAspect:aspect, uRadius:VRAD, uColor:[fx,fy,0], uPoint:[x,y] });
    vel.swap();
  };
  const splatDye = (x, y, c, rad) => {
    pass(P.splat, dye.w, { uTarget:{tex:dye.r.t}, uAspect:aspect, uRadius:rad||DRAD, uColor:c, uPoint:[x,y] });
    dye.swap();
  };

  const ptr = { x:0.5, y:0.5, dx:0, dy:0, moved:false };
  addEventListener('pointermove', e => {
    const nx = e.clientX/innerWidth, ny = 1 - e.clientY/innerHeight;
    ptr.dx = nx - ptr.x; ptr.dy = ny - ptr.y; ptr.x = nx; ptr.y = ny; ptr.moved = true;
  }, {passive:true});
  addEventListener('pointerdown', e => {
    const c = palette.cur[2];
    splatDye(e.clientX/innerWidth, 1 - e.clientY/innerHeight, [c[0]*0.5, c[1]*0.5, c[2]*0.5], 0.008);
  }, {passive:true});

  bus.addEventListener('nav', () => {
    for(let i = 0; i < 5; i++){
      const x = 0.15 + Math.random()*0.7, y = 0.15 + Math.random()*0.7, a = Math.random()*6.283;
      splatVel(x, y, Math.cos(a)*800, Math.sin(a)*800);
      const c = palette.cur[Math.random() < 0.55 ? 2 : 1];
      splatDye(x, y, [c[0]*0.35, c[1]*0.35, c[2]*0.35], 0.007);
    }
  });

  const stir = t => {
    for(let k = 0; k < 2; k++){
      const ph = k * 2.1;
      const x = 0.5 + 0.37*Math.sin(t*0.21 + ph);
      const y = 0.5 + 0.31*Math.sin(t*0.293 + ph*1.6 + 1.3);
      splatVel(x, y, Math.cos(t*0.21+ph)*46, Math.cos(t*0.293+ph*1.6+1.3)*40);
      const c = palette.cur[k ? 1 : 2];
      splatDye(x, y, [c[0]*0.016, c[1]*0.016, c[2]*0.016]);
    }
  };

  const ITERS = MOBILE() ? 12 : 20, DT = 1/60;
  function step(now){
    requestAnimationFrame(step);
    lerpPalette();
    const t = now / 1000;
    stir(t);
    if(ptr.moved){
      ptr.moved = false;
      splatVel(ptr.x, ptr.y, ptr.dx*FORCE, ptr.dy*FORCE);
      const c = palette.cur[2];
      const m = Math.min(Math.hypot(ptr.dx, ptr.dy)*40, 1);
      splatDye(ptr.x, ptr.y, [c[0]*0.22*m, c[1]*0.22*m, c[2]*0.22*m]);
    }
    pass(P.advect, vel.w, { uVel:{tex:vel.r.t}, uSrc:{tex:vel.r.t}, uTexel:texel, uDt:DT, uDiss:0.997 });
    vel.swap();
    pass(P.diverge, dvg, { uVel:{tex:vel.r.t}, uTexel:texel });
    gl.bindFramebuffer(gl.FRAMEBUFFER, prs.w.f); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); prs.swap();
    for(let i = 0; i < ITERS; i++){
      pass(P.pressure, prs.w, { uPre:{tex:prs.r.t}, uDiv:{tex:dvg.t}, uTexel:texel });
      prs.swap();
    }
    pass(P.gradsub, vel.w, { uPre:{tex:prs.r.t}, uVel:{tex:vel.r.t}, uTexel:texel });
    vel.swap();
    pass(P.advect, dye.w, { uVel:{tex:vel.r.t}, uSrc:{tex:dye.r.t}, uTexel:texel, uDt:DT, uDiss:0.988 });
    dye.swap();
    pass(P.show, null, { uDye:{tex:dye.r.t}, uCA:palette.cur[0], uCB:palette.cur[1], uAcc:palette.cur[2],
                         uPoint:[ptr.x, ptr.y], uAspect:aspect, uTime:t });
  }
  requestAnimationFrame(step);
  return true;
}
