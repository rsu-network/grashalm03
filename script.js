(() => {
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const cursor = document.getElementById('cursor');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, dpr;
  const mouse = { x: -9999, y: -9999 };
  let particles = [];
  const bursts = [];
  const COLORS = ['#7c3aed', '#22d3ee', '#f43f5e', '#ffffff'];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    const n = Math.min(140, Math.floor((innerWidth * innerHeight) / 11000));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .6 * dpr, vy: (Math.random() - .5) * .6 * dpr,
      r: (Math.random() * 1.8 + .6) * dpr,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
  }
  addEventListener('resize', resize);
  resize();

  addEventListener('pointermove', e => {
    mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    stage.style.transform = `translate(${nx * -22}px, ${ny * -22}px) rotateX(${ny * -6}deg) rotateY(${nx * 8}deg)`;
  });
  addEventListener('pointerdown', e => {
    cursor.classList.add('big');
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, s = (Math.random() * 6 + 2) * dpr;
      bursts.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 1, c: COLORS[(Math.random() * 3) | 0] });
    }
  });
  addEventListener('pointerup', () => cursor.classList.remove('big'));

  const LINK = 140;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    const link = LINK * dpr;

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 160 * dpr && d > 0) {
        p.x += (dx / d) * 2.2 * dpr; p.y += (dy / d) * 2.2 * dpr;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 12 * dpr;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(124,120,255,${(1 - d / link) * .35})`;
          ctx.lineWidth = dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 200 * dpr) {
        ctx.strokeStyle = `rgba(34,211,238,${(1 - dm / (200 * dpr)) * .7})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy; b.vx *= .96; b.vy *= .96; b.life -= .02;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      ctx.globalAlpha = b.life;
      ctx.fillStyle = b.c; ctx.shadowColor = b.c; ctx.shadowBlur = 14 * dpr;
      ctx.fillRect(b.x, b.y, 3 * dpr, 3 * dpr);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    if (!reduce) requestAnimationFrame(frame);
  }
  frame();

  // Typewriter loop
  const typed = document.getElementById('typed');
  const words = ['GRASHALM03', 'WIRD GEBAUT', 'BALD ONLINE', 'STAY TUNED'];
  let wi = 0, ci = 0, del = false;
  (function type() {
    const w = words[wi];
    typed.textContent = w.slice(0, ci);
    let t = del ? 45 : 110;
    if (!del && ci === w.length) { del = true; t = 1400; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; t = 350; }
    else ci += del ? -1 : 1;
    setTimeout(type, t);
  })();

  // Fake loading bar that never quite finishes
  const fill = document.getElementById('fill'), pct = document.getElementById('pct');
  let v = 0;
  (function load() {
    v += Math.random() * (v < 70 ? 4 : v < 90 ? 1.2 : .15);
    if (v >= 99) v = 99;
    fill.style.width = v + '%';
    pct.textContent = Math.floor(v);
    setTimeout(load, 140 + Math.random() * 260);
  })();

  // Random extra glitch pulses on the title
  const title = document.querySelector('.glitch');
  setInterval(() => {
    title.style.textShadow = `${(Math.random() * 12 - 6) | 0}px 0 #f43f5e, ${(Math.random() * 12 - 6) | 0}px 0 #22d3ee`;
    setTimeout(() => (title.style.textShadow = ''), 90);
  }, 1800);
})();
