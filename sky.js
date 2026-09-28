// Himmel (WebGL-Wolken) + Gras im Vordergrund. Reagiert auf Maus als Wind.
(() => {
  const $ = id => document.getElementById(id);
  const sky = $('sky'), grass = $('grass'), gx = grass.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.MOUSE = { x: -9999, y: -9999, last: -1e9 });
  const S = { cover: 1, rise: 0, grow: 0, t0: -1, burst: { x: 0, y: 0, at: -1e9 } };
  const ease = { out: t => 1 - Math.pow(1 - t, 3), io: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) };

  // ---------------- WebGL: Wolken ----------------
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime, uCover, uRise; uniform vec2 uMouse; uniform vec3 uBurst;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= .5; }
  return v;
}
float cloud(vec2 q, float t){ return fbm(q + vec2(noise(q * .5 + t * .02) * .9)); }

void main(){
  vec2 frag = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = (frag - .5 * uRes) / uRes.y;
  // Kamera steigt durch die Wolkendecke
  p = p * mix(1.55, 1., uRise) + vec2(0., -.12 * (1. - uRise));

  // Wind-Wirbel um den Cursor
  vec2 m = (uMouse - .5 * uRes) / uRes.y;
  m = m * mix(1.55, 1., uRise) + vec2(0., -.12 * (1. - uRise));
  vec2 d = p - m; float md = length(d);
  vec2 pw = p + vec2(-d.y, d.x) * exp(-md * 3.6) * .28;
  // Klick-Druckwelle
  if (uBurst.z >= 0.){
    vec2 bc = (uBurst.xy - .5 * uRes) / uRes.y; vec2 bd = pw - bc; float bl = length(bd);
    pw += bd / (bl + 1e-4) * exp(-abs(bl - uBurst.z * .9) * 9.) * .07 * exp(-uBurst.z * 1.8);
  }

  float h = clamp(frag.y / uRes.y, 0., 1.);
  vec3 zenith = vec3(.16, .46, .93), horizon = vec3(.80, .91, 1.);
  vec3 col = mix(horizon, zenith, pow(h, .7));

  vec2 sun = vec2(aspect * .31, .43);
  float sd = length(p - sun);
  col += vec3(1., .96, .86) * (exp(-sd * 2.4) * .32 + exp(-sd * 10.) * .6);
  vec2 sv = p - sun;
  float ang = atan(sv.y, sv.x);
  float rays = pow(max(0., sin(ang * 11. + uTime * .07 + fbm(vec2(ang * 3., uTime * .04)) * 4.)), 7.) * exp(-sd * 1.7) * .12;
  col += vec3(1., .97, .9) * rays;

  float t = uTime;
  float thr = mix(.50, -.2, uCover);
  vec2 toSun = normalize(sun - pw) * .16;

  // hintere Schicht
  vec2 q1 = pw * vec2(1., 1.7) * 2.2 + vec2(t * .03, 3.);
  float d1 = cloud(q1, t), l1 = cloud(q1 + toSun * 2.2, t);
  float c1 = smoothstep(thr, thr + .3, d1) * .85;
  float s1 = clamp(.58 + (d1 - l1) * 3.6, 0., 1.);
  col = mix(col, mix(vec3(.58, .71, .90), vec3(1., .99, .97), s1), c1);

  // vordere Schicht, größer und schneller
  vec2 q2 = pw * vec2(.8, 1.35) * 3.3 + vec2(t * .065, 11.);
  float d2 = cloud(q2, t + 7.), l2 = cloud(q2 + toSun * 2.6, t + 7.);
  float c2 = smoothstep(thr + .06, thr + .36, d2) * (1. - h * .35);
  float s2 = clamp(.55 + (d2 - l2) * 3.8, 0., 1.);
  col = mix(col, mix(vec3(.62, .75, .93), vec3(1.), s2), c2);

  col = mix(col, vec3(.94, .97, 1.), uCover * .5);      // Dunst in der Wolkendecke
  col += (hash(frag + t) - .5) / 255.;                  // Dithering gegen Banding
  gl_FragColor = vec4(col, 1.);
}`;

  const gl = sky.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  let prog, loc = {}, scale = .55, sw = 1, sh = 1;
  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let glOK = false;
  try {
    if (!gl) throw new Error('no webgl');
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uTime', 'uCover', 'uRise', 'uMouse', 'uBurst'].forEach(n => (loc[n] = gl.getUniformLocation(prog, n)));
    glOK = true;
  } catch (e) { document.body.classList.add('nogl'); }

  // ---------------- Gras ----------------
  let gw = 0, gh = 0, gdpr = 1, blades = [];
  const LAYERS = [
    { col: '#9ccbf5', hMul: .62, n: 1.0, w: 1.0 },
    { col: '#5b9fe6', hMul: .82, n: .8, w: 1.15 },
    { col: '#1560ad', hMul: 1.0, n: .6, w: 1.3 },
  ];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2); gdpr = dpr;
    sw = Math.max(2, Math.floor(innerWidth * scale)); sh = Math.max(2, Math.floor(innerHeight * scale));
    sky.width = sw; sky.height = sh;
    gw = innerWidth; gh = Math.min(innerHeight * (innerWidth < 820 ? .14 : .2), 220);
    grass.width = gw * dpr; grass.height = gh * dpr; grass.style.height = gh + 'px';
    blades = [];
    LAYERS.forEach((L, li) => {
      const n = Math.floor((gw / 5.5) * L.n);
      for (let i = 0; i < n; i++) {
        blades.push({ li, x: (i + Math.random() * .9) * (gw / n), h: (gh * .5 + Math.random() * gh * .5) * L.hMul, w: (3 + Math.random() * 4) * L.w,
          ph: Math.random() * 6.28, b: 0, delay: Math.random() * .9 + li * .18 });
      }
    });
    if (glOK) gl.viewport(0, 0, sw, sh);
  }
  addEventListener('resize', resize);
  resize();

  function windPoint(now) {
    if (now - M.last < 2600) return M;
    const s = now / 1000;
    return { x: innerWidth * (.5 + .38 * Math.cos(s * .23)), y: innerHeight * (.5 + .3 * Math.sin(s * .31)) };
  }

  function drawGrass(now, time, wind) {
    gx.setTransform(gdpr, 0, 0, gdpr, 0, 0);
    gx.clearRect(0, 0, gw, gh);
    const top = innerHeight - gh;
    for (const bl of blades) {
      const L = LAYERS[bl.li];
      const g = S.grow < 0 ? 0 : ease.out(Math.max(0, Math.min(1, (S.grow - bl.delay) / 1.1)));
      if (g <= 0) continue;
      const gust = Math.sin(time * 1.5 + bl.ph * .3 + bl.x * .006) * .55 + Math.sin(time * .6 + bl.x * .0028) * .45;
      let target = gust * bl.h * .2 + Math.sin(time * 2.6 + bl.ph) * bl.h * .03;
      // Cursor drückt die Halme weg
      const dx = bl.x - wind.x, near = Math.exp(-(dx * dx) / (2 * 110 * 110)) * Math.max(0, Math.min(1, (wind.y - (top - 60)) / (gh + 60)));
      target += Math.sign(dx || 1) * near * bl.h * .75;
      bl.b += (target - bl.b) * .1;
      const hh = bl.h * g, tx = bl.x + bl.b * g, ty = gh - hh, cx = bl.x + bl.b * .28 * g, cy = gh - hh * .55;
      gx.fillStyle = L.col;
      gx.beginPath();
      gx.moveTo(bl.x - bl.w / 2, gh + 2);
      gx.quadraticCurveTo(cx - bl.w * .32, cy, tx, ty);
      gx.quadraticCurveTo(cx + bl.w * .32, cy, bl.x + bl.w / 2, gh + 2);
      gx.fill();
    }
  }

  // ---------------- Loop ----------------
  const t0 = performance.now();
  function frame(now) {
    const time = (now - t0) / 1000;
    if (S.t0 >= 0) {
      const e = (now - S.t0) / 1000;
      S.cover = 1 - ease.io(Math.min(1, e / 3.2));
      S.rise = ease.out(Math.min(1, e / 3.8));
      S.grow = Math.max(0, e - .9);
    }
    const w = windPoint(now);
    if (glOK) {
      gl.uniform2f(loc.uRes, sw, sh); gl.uniform1f(loc.uTime, time); gl.uniform1f(loc.uCover, S.cover); gl.uniform1f(loc.uRise, S.rise);
      gl.uniform2f(loc.uMouse, w.x * scale, (innerHeight - w.y) * scale);
      const age = (now - S.burst.at) / 1000;
      gl.uniform3f(loc.uBurst, S.burst.x * scale, (innerHeight - S.burst.y) * scale, age < 3 ? age : -1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    drawGrass(now, time, w);
    if (!reduce) requestAnimationFrame(frame);
  }

  window.FX = {
    start() {
      if (reduce) { S.cover = 0; S.rise = 1; S.grow = 5; frame(performance.now()); return; }
      S.t0 = performance.now();
    },
    burst(x, y) { S.burst = { x, y, at: performance.now() }; },
  };
  requestAnimationFrame(frame);
})();
