/* Northern lights over the field.

   Built from how the sky actually behaves, not from memory:

   - Colour comes from two gases at two heights. Oxygen at 120 to 150 km
     gives the pale green that dominates every real display. Nitrogen at
     the very bottom edge emits instantly, so a curtain has a pink fringe
     under it. Oxygen above 300 km glows dark red, faint, at the tips.
     A purely blue aurora is the first tell of a fake one, so the blue
     here comes from the sky behind it, not from the light.
   - Shape is a band anchored to the horizon, broken into vertical
     filaments that follow the magnetic field.
   - Motion is slow: the band drifts over tens of seconds while ripples
     run along it every few seconds. Nothing flickers frame to frame.

   The render is the triangle-wave noise march that real time graphics
   settled on for this: cheap value noise made from triangle waves, five
   octaves each rotated so nothing lines up with an axis, marched along
   the view ray with a perspective shear, which is what turns a flat
   noise field into a hanging curtain. Colour is a cosine palette keyed
   to the step, so it climbs pink to green to red along each ray.

   It paints on a transparent canvas over the blue field and adds light,
   so the field underneath is untouched. */

const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const FS = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float light;     /* 0 dark sky, 1 pale sky */

float tri(float x){ return clamp(abs(fract(x) - 0.5), 0.01, 0.49); }
vec2 tri2(vec2 p){ return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }
mat2 mm2(float a){ float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* five octaves of triangle noise, each rotated, each drifting at its own
   speed: filaments that ripple instead of a blob that slides */
float triNoise2d(vec2 p, float spd){
  float z = 1.8, z2 = 2.5, rz = 0.0;
  p *= mm2(p.x * 0.06);
  vec2 bp = p;
  for (int i = 0; i < 5; i++){
    vec2 dg = tri2(bp * 1.85) * 0.75;
    dg *= mm2(t * spd);
    p -= dg / z2;
    bp *= 1.3;
    z2 *= 0.45;
    z *= 0.42;
    p *= 1.21 + (rz - 1.0) * 0.02;
    rz += tri(p.x + tri(p.y)) * z;
    p *= -mm2(0.9);
  }
  return clamp(1.0 / pow(rz * 29.0, 1.3), 0.0, 0.55);
}

/* ONE main arc across the sky, with a few smaller ones around it: a
   soft band whose centre waves along its length, the way a real arc
   bows and kinks instead of running straight */
float arc(vec2 p, float yc, float h, float amp, float ph, float spd){
  float y = yc
    + amp * sin(p.x * 2.0 + ph + t * spd)
    + amp * 0.45 * sin(p.x * 4.6 - ph * 1.7 - t * spd * 0.7)
    + amp * 0.25 * sin(p.x * 9.1 + ph * 0.6 + t * spd * 1.3);
  float d = (p.y - y) / h;
  return exp(-d * d);
}

/* the curtain: march up the view ray, sampling the noise through a
   perspective shear so the sheet hangs instead of lying flat */
vec4 curtain(vec3 ro, vec3 rd, vec2 frag){
  vec4 col = vec4(0.0), avg = vec4(0.0);
  for (float i = 0.0; i < 40.0; i++){
    float of = 0.006 * hash21(frag) * smoothstep(0.0, 12.0, i);
    float pt = ((0.8 + pow(i, 1.4) * 0.002) - ro.y) / (rd.y * 2.0 + 0.35);
    pt -= of;
    vec3 bpos = ro + pt * rd;
    float d = triNoise2d(bpos.zx, 0.05);
    /* fewer curtains, brighter ones: the haze between the filaments is
       cut away, so what is left is separate ribbons of vivid light */
    /* keep a continuous body so the arc runs right across the sky, and
       let the filaments ride on top of it */
    d = (0.34 + 0.66 * smoothstep(0.08, 0.42, d)) * d * 2.4;

    /* the colour climbs the ray: nitrogen pink at the foot, oxygen green
       through the body, thin oxygen red at the tips */
    float k = i / 40.0;
    /* dark sky: the real display, nitrogen pink into oxygen green */
    vec3 dark = mix(vec3(1.00, 0.22, 0.66), vec3(0.10, 1.00, 0.45), smoothstep(0.02, 0.30, k));
    dark = mix(dark, vec3(0.16, 1.00, 0.82), smoothstep(0.30, 0.62, k));
    dark = mix(dark, vec3(1.00, 0.16, 0.40), smoothstep(0.70, 1.0, k) * 0.8);
    /* pale sky: its own palette, violet into royal blue into rose, which
       reads on white where green would go muddy */
    vec3 pale = mix(vec3(0.62, 0.34, 0.92), vec3(0.22, 0.46, 0.98), smoothstep(0.02, 0.34, k));
    pale = mix(pale, vec3(0.35, 0.62, 1.00), smoothstep(0.34, 0.66, k));
    pale = mix(pale, vec3(0.95, 0.42, 0.72), smoothstep(0.70, 1.0, k) * 0.8);
    vec3 c = mix(dark, pale, light);

    vec4 s = vec4(c * d, d);
    avg = mix(avg, s, 0.5);
    col += avg * exp2(-i * 0.065 - 2.5) * smoothstep(0.0, 5.0, i);
  }
  col *= smoothstep(-0.30, 0.22, rd.y);   /* it fades into the horizon */
  return col * 3.0;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - res * 0.5) / res.y;

  /* the camera is under the display, looking up into it: the curtains
     fill the sky from the floor to the ceiling of the screen */
  vec3 ro = vec3(0.0, 0.0, -6.7);
  vec3 rd = normalize(vec3(uv.x, uv.y * 0.45 + 0.34, 1.05));

  vec4 a = vec4(0.0);
  if (rd.y > 0.0) a = curtain(ro, rd, gl_FragCoord.xy);

  /* the display: one main arc, and three quieter ones around it */
  vec2 sp = gl_FragCoord.xy / res;
  float m = arc(sp, 0.46, 0.135, 0.055, 0.0, 0.05) * 1.00      /* the main one */
          + arc(sp, 0.60, 0.055, 0.040, 2.3, 0.037) * 0.45
          + arc(sp, 0.33, 0.050, 0.045, 4.9, 0.028) * 0.40
          + arc(sp, 0.69, 0.038, 0.030, 1.2, 0.044) * 0.22;
  a *= clamp(m, 0.0, 1.35);

  /* the middle of the screen carries the cross: the lights step back
     there so nothing on top of them has to fight for contrast */
  float cx = smoothstep(0.06, 0.30, sp.x) * (1.0 - smoothstep(0.72, 0.99, sp.x));
  float cy = smoothstep(0.22, 0.40, sp.y) * (1.0 - smoothstep(0.72, 0.92, sp.y));
  a *= 1.0 - 0.72 * cx * cy;

  /* the same green and pink in both modes: on the pale sky the canvas
     multiplies instead of adding, so the colours tint the white rather
     than glowing on it, and they need a little more push to show */
  float amount = mix(0.62, 0.78, light);
  vec3 col = a.rgb * amount;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
  return s;
}

export function initAurora(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'res');
  const uT = gl.getUniformLocation(prog, 't');
  const uLight = gl.getUniformLocation(prog, 'light');

  let lightNow = document.body.classList.contains('light') ? 1 : 0;
  let lightWant = lightNow;
  const setLight = v => { lightWant = v ? 1 : 0; };

  function size() {
    /* the march is the expensive part: render at half and let the canvas
       scale up. The light is soft, so nothing shows. */
    const dpr = Math.min(devicePixelRatio || 1, 1) * (innerWidth < 760 ? 0.5 : 0.62);
    canvas.width = Math.max(2, Math.round(innerWidth * dpr));
    canvas.height = Math.max(2, Math.round(innerHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  size();
  addEventListener('resize', size);

  let raf = 0;
  const t0 = performance.now();
  function frame(now) {
    lightNow += (lightWant - lightNow) * 0.04;   /* the mode crossfades */
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.uniform1f(uLight, lightNow);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  start();
  return { start, stop, setLight };
}
