(() => {
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  const glow = document.getElementById('glow');
  const dot = document.getElementById('dot');
  const title = document.getElementById('title');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Title split into letters ----
  let idx = 0;
  'Coming Soon'.split(' ').forEach(word => {
    const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    [...word].forEach(ch => {
      const l = document.createElement('span'); l.className = 'l'; l.textContent = ch;
      l.style.setProperty('--i', idx++); w.appendChild(l);
    });
    title.appendChild(w);
  });
  const letters = [...title.querySelectorAll('.l')];

  // ---- Flow-field particles ----
  const start = performance.now();
  let W, H, dpr, parts = [];
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: false, down: 0 };
  let t = 0;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    ctx.fillStyle = '#03060c'; ctx.fillRect(0, 0, W, H);
    const n = Math.min(1400, Math.floor(innerWidth * innerHeight / 1400));
    parts = Array.from({ length: n }, () => spawn());
    mouse.x = mouse.tx = W / 2; mouse.y = mouse.ty = H / 2;
  }
  const spawn = () => ({ x: Math.random() * W, y: Math.random() * H, life: Math.random() * 200 });
  addEventListener('resize', resize);
  resize();

  // cheap smooth pseudo-noise angle field
  const angle = (x, y) => {
    const s = .0014 / dpr;
    return (Math.sin(x * s + t * .4) + Math.cos(y * s * 1.3 - t * .3) + Math.sin((x + y) * s * .7 + t * .2)) * 1.6;
  };

  function frame() {
    t += .006;
    mouse.x += (mouse.tx - mouse.x) * .12; mouse.y += (mouse.ty - mouse.y) * .12;

    // fading trails
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(3,6,12,.09)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.1 * dpr;

    const R = 260 * dpr;
    for (const p of parts) {
      let a = angle(p.x, p.y);
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      let sp = 1.4 * dpr;
      if (mouse.on && d < R) {
        const k = 1 - d / R;
        a = Math.atan2(dy, dx) + Math.PI / 2 + k;   // swirl around cursor
        sp += k * 4.5 * dpr * (1 + mouse.down * 2);
      }
      const nx = p.x + Math.cos(a) * sp, ny = p.y + Math.sin(a) * sp;
      const bright = mouse.on && d < R ? .55 : .22;
      ctx.strokeStyle = `rgba(${140 + (bright * 90) | 0},${205 + (bright * 40) | 0},255,${bright})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      if (--p.life < 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) Object.assign(p, spawn(), { life: 120 + Math.random() * 200 });
    }
    mouse.down *= .93;

    // letters react to cursor
    const mx = mouse.x / dpr, my = mouse.y / dpr;
    for (const l of letters) {
      if (performance.now() - start < 2800 && !reduce) continue;   // let the intro play
      const r = l.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(cx - mx, cy - my), k = mouse.on ? Math.max(0, 1 - d / 240) : 0;
      const wave = Math.sin(t * 6 - letters.indexOf(l) * .5) * 3;
      l.style.animation = 'none'; l.style.opacity = 1;
      l.style.transform = `translate(${(cx - mx) * k * .12}px, ${wave - k * 18}px) scale(${1 + k * .35})`;
      l.style.textShadow = `0 0 ${24 + k * 50}px rgba(90,190,255,${.55 + k * .45})`;
      l.style.color = k > .05 ? `hsl(200, 100%, ${88 - k * 8}%)` : '';
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  addEventListener('pointermove', e => {
    mouse.tx = e.clientX * dpr; mouse.ty = e.clientY * dpr; mouse.on = true;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  document.addEventListener('pointerleave', () => (mouse.on = false));
  addEventListener('pointerdown', () => { mouse.down = 1; dot.classList.add('big'); });
  addEventListener('pointerup', () => dot.classList.remove('big'));

  // idle: cursor drifts on its own until the user moves the mouse
  let idle = performance.now();
  addEventListener('pointermove', () => (idle = performance.now()));
  setInterval(() => {
    if (performance.now() - idle > 2500) {
      const s = performance.now() / 1000;
      mouse.tx = (W / 2) + Math.cos(s * .6) * W * .3; mouse.ty = (H / 2) + Math.sin(s * .9) * H * .25; mouse.on = true;
      glow.style.transform = `translate(${mouse.tx / dpr}px, ${mouse.ty / dpr}px)`;
    }
  }, 30);

  frame();
})();
