// Volumetrische Wolken (Raymarching im Fragment-Shader). Die Kamera fliegt über einem Wolkenmeer,
// beim Betreten steigt sie aus der Wolkendecke nach oben. Die Maus lenkt den Blick.
(() => {
  const $ = id => document.getElementById(id);
  const sky = $('sky');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.MOUSE = { x: -9999, y: -9999, last: -1e9 });
  const S = { rise: 0, t0: -1, burst: { x: 0, y: 0, at: -1e9 } };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime, uRise; uniform vec2 uMouse; uniform vec3 uBurst; uniform sampler2D uNoise;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// 3D-Rauschen aus einer 2D-Textur (Trick: z verschiebt die Lookup-Koordinate)
float noise(vec3 x){
  vec3 p = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  vec2 uv = p.xy + vec2(37., 17.) * p.z + f.xy;
  vec2 rg = texture2D(uNoise, (uv + .5) / 256.).yx;
  return mix(rg.x, rg.y, f.z);
}
float map(vec3 p){
  vec3 q = p - vec3(0., .05, 1.) * uTime * .32;
  float f = .5 * noise(q); q *= 2.02;
  f += .25 * noise(q); q *= 2.03;
  f += .125 * noise(q); q *= 2.01;
  f += .0625 * noise(q);
  return clamp((1.85 * f - .80 - 1.1 * (p.y + .55)) * 1.45, 0., 1.);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  // Klick-Druckwelle
  if (uBurst.z >= 0.){
    vec2 bc = (uBurst.xy - .5 * uRes) / uRes.y; vec2 bd = uv - bc; float bl = length(bd);
    uv += bd / (bl + 1e-4) * exp(-abs(bl - uBurst.z * .7) * 10.) * .05 * exp(-uBurst.z * 1.8);
  }

  // Kamera: aus der Wolkendecke nach oben
  float camY = mix(-1.3, .02, uRise);
  vec3 ro = vec3(0., camY, 0.);
  vec2 m = uMouse / uRes - .5;
  float yaw = m.x * .55, pitch = .02 + m.y * .30;
  vec3 rd = normalize(vec3(uv, 1.35));
  float cp = cos(pitch), sp = sin(pitch); rd = vec3(rd.x, rd.y * cp + rd.z * sp, -rd.y * sp + rd.z * cp);
  float cy = cos(yaw), sy = sin(yaw);     rd = vec3(rd.x * cy + rd.z * sy, rd.y, -rd.x * sy + rd.z * cy);

  // Himmel
  vec3 sundir = normalize(vec3(.62, .30, .72));
  float sun = clamp(dot(sundir, rd), 0., 1.);
  vec3 skyc = mix(vec3(.82, .92, 1.), vec3(.15, .46, .94), pow(clamp(rd.y * 1.5 + .12, 0., 1.), .6));
  skyc += vec3(1., .95, .85) * (pow(sun, 6.) * .28 + pow(sun, 48.) * .45 + pow(sun, 900.) * 1.3);

  // Raymarch durch die Wolken
  vec3 fogc = vec3(.83, .92, 1.);
  vec4 sum = vec4(0.);
  float t = .06 * hash(gl_FragCoord.xy + uTime);
  float inside = (1. - uRise) * .65;
  for (int i = 0; i < 64; i++){
    vec3 pos = ro + t * rd;
    if (sum.a > .985) break;
    if (pos.y > .6 && rd.y > 0.) break;
    if (pos.y < -4.) break;
    float den = map(pos);
    if (den > .01){
      float dif = clamp((den - map(pos + .35 * sundir)) / .42, 0., 1.);
      vec3 lin = vec3(1., .96, .90) * dif * 1.05 + vec3(.74, .84, 1.);
      vec3 c = mix(vec3(1., .985, .96), vec3(.52, .66, .88), den);
      c = mix(c, vec3(1.), inside);
      vec4 col = vec4(c * lin, den);
      col.rgb = mix(col.rgb, fogc, 1. - exp(-.0035 * t * t));
      col.a *= .52;
      col.rgb *= col.a;
      sum += col * (1. - sum.a);
    }
    t += max(.07, .075 * t);
  }
  vec3 col = skyc * (1. - sum.a) + sum.rgb;
  col = mix(col, smoothstep(0., 1., col), .25);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - .5) / 255.;
  gl_FragColor = vec4(col, 1.);
}`;

  const gl = sky.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  const loc = {};
  let scale = innerWidth < 820 ? .5 : .66, sw = 2, sh = 2, glOK = false;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  try {
    if (!gl) throw new Error('no webgl');
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uTime', 'uRise', 'uMouse', 'uBurst', 'uNoise'].forEach(n => (loc[n] = gl.getUniformLocation(prog, n)));

    // 256x256 Rauschtextur: G-Kanal = R-Kanal um (37,17) verschoben
    const R = new Uint8Array(256 * 256); for (let i = 0; i < R.length; i++) R[i] = Math.random() * 256;
    const data = new Uint8Array(256 * 256 * 4);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      data[i] = R[y * 256 + x]; data[i + 1] = R[((y - 17) & 255) * 256 + ((x - 37) & 255)]; data[i + 3] = 255;
    }
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(loc.uNoise, 0);
    glOK = true;
  } catch (e) { document.body.classList.add('nogl'); }

  function resize() {
    sw = Math.max(2, Math.floor(innerWidth * scale)); sh = Math.max(2, Math.floor(innerHeight * scale));
    sky.width = sw; sky.height = sh;
    if (glOK) gl.viewport(0, 0, sw, sh);
  }
  addEventListener('resize', resize);
  resize();

  function windPoint(now) {
    if (now - M.last < 2600) return { x: M.x, y: M.y };
    const s = now / 1000;
    return { x: innerWidth * (.5 + .3 * Math.cos(s * .17)), y: innerHeight * (.5 + .22 * Math.sin(s * .23)) };
  }

  const cur = { x: innerWidth / 2, y: innerHeight / 2 };
  const t0 = performance.now();
  let last = t0, ema = 16, frames = 0;
  function frame(now) {
    const time = (now - t0) / 1000;
    if (S.t0 >= 0) S.rise = easeOut(Math.min(1, ((now - S.t0) / 1000) / 4.2));
    const w = windPoint(now);
    cur.x += (w.x - cur.x) * .05; cur.y += (w.y - cur.y) * .05;
    if (glOK) {
      gl.uniform2f(loc.uRes, sw, sh); gl.uniform1f(loc.uTime, time); gl.uniform1f(loc.uRise, S.rise);
      gl.uniform2f(loc.uMouse, cur.x / innerWidth * sw, (1 - cur.y / innerHeight) * sh);
      const age = (now - S.burst.at) / 1000;
      gl.uniform3f(loc.uBurst, S.burst.x / innerWidth * sw, (1 - S.burst.y / innerHeight) * sh, age < 3 ? age : -1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    // Auflösung automatisch senken, wenn die Grafikkarte nicht mitkommt
    ema += ((now - last) - ema) * .05; last = now;
    if (++frames % 90 === 0 && ema > 26 && scale > .26) { scale = Math.max(.26, scale * .82); resize(); }
    if (!reduce) requestAnimationFrame(frame);
  }

  window.FX = {
    start() {
      if (reduce) { S.rise = 1; frame(performance.now()); return; }
      S.t0 = performance.now();
    },
    burst(x, y) { S.burst = { x, y, at: performance.now() }; },
  };
  requestAnimationFrame(frame);
})();
