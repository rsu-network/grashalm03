(() => {
  const P = window.PROFILE;
  const $ = id => document.getElementById(id);
  const canvas = $('fx'), ctx = canvas.getContext('2d');
  const glow = $('glow'), dot = $('dot'), stage = $('stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Inhalt aus config.js ----------
  document.title = P.name;
  $('name').textContent = P.name;

  const ICONS = {
    discord: 'M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.5a18 18 0 0 0-4.4 0L10.6 3a19.8 19.8 0 0 0-4.9 1.4C2.6 9 1.8 13.5 2.2 18a19.9 19.9 0 0 0 6 3l.8-1.3a13 13 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.1 0l.5.4a13 13 0 0 1-2 1l.8 1.3a19.9 19.9 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.6ZM8.7 15.3c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Zm6.6 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Z',
    github: 'M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.300.1-2.700 0 0 .8-.3 2.800 1a9.700 9.700 0 0 1 5 0c1.900-1.300 2.800-1 2.800-1 .5 1.400.2 2.400.1 2.700.6.700 1 1.600 1 2.700 0 3.900-2.400 4.700-4.600 5 .4.3.7.9.7 1.900v2.800c0 .3.2.6.7.5A10 10 0 0 0 12 2Z',
    youtube: 'M21.6 7.2a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800ZM10 15V9l5.200 3-5.200 3Z',
    twitch: 'M4 3 3 6.500V19h4v2.500h2.500L13 19h3.500L21 14.500V3H4Zm15 10.500-2.500 2.500h-4l-2.500 2.500V16H6.500V5H19v8.500ZM16.500 8h-2v4.500h2V8Zm-5 0h-2v4.500h2V8Z',
    tiktok: 'M16.600 2h-3.200v13.200a2.800 2.800 0 1 1-2.800-2.800c.3 0 .6 0 .8.100V9.200a6 6 0 1 0 5.200 5.900V8.400a7.400 7.400 0 0 0 4.200 1.300V6.500a4.300 4.300 0 0 1-4.200-4.500Z',
    instagram: 'M12 7.300A4.700 4.700 0 1 0 12 16.700 4.700 4.700 0 0 0 12 7.300Zm0 7.700a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.900a1.100 1.100 0 1 1-2.200 0 1.100 1.100 0 0 1 2.200 0ZM21 12c0-2.800 0-3.100-.1-4.200-.1-1.100-.4-1.900-.9-2.600A4.300 4.300 0 0 0 17.400 3.100C16.300 3 16 3 12 3s-4.300 0-5.400.1c-1.100.1-1.900.4-2.600.9-.7.5-1.100 1.100-1.500 1.900C2.400 6.100 2.100 6.900 2 8 2 9 2 9.300 2 12s0 3 .1 4c.1 1.100.4 1.900.9 2.600a4.300 4.300 0 0 0 2.600.9C6.700 20 7 20 12 20s3.300 0 4.400-.1c1.100-.1 1.900-.4 2.600-.9.700-.7 1-1.500 1.100-2.600C20.900 15 21 14.800 21 12Z',
    x: 'M17.800 3h3.100l-6.800 7.700L22 21h-6.200l-4.900-6.300L5.300 21H2.200l7.300-8.300L2 3h6.400l4.400 5.800L17.800 3Zm-1.100 16.200h1.700L7.400 4.700H5.600l11.100 14.500Z',
    link: 'M10.600 13.400a1 1 0 0 1 0-1.400l3-3a3 3 0 0 1 4.200 4.200l-2 2a1 1 0 0 1-1.400-1.400l2-2a1 1 0 0 0-1.400-1.400l-3 3a1 1 0 0 1-1.400 0Zm2.800-2.800a1 1 0 0 1 0 1.400l-3 3a3 3 0 0 1-4.200-4.200l2-2a1 1 0 0 1 1.400 1.400l-2 2a1 1 0 0 0 1.400 1.400l3-3a1 1 0 0 1 1.400 0Z',
  };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = d => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p); return s; };

  P.links.forEach((l, i) => {
    const li = document.createElement('li'); li.style.setProperty('--i', i);
    const a = document.createElement('a'); a.href = l.url; a.rel = 'noopener noreferrer';
    a.title = l.label; a.setAttribute('aria-label', l.label); a.draggable = false;
    if (l.url !== '#') a.target = '_blank';
    a.appendChild(svg(ICONS[l.icon] || ICONS.link));
    const t = document.createElement('span'); t.textContent = l.label; a.appendChild(t);
    const ar = svg('M9 5l7 7-7 7'); ar.classList.add('arrow'); ar.setAttribute('fill', 'none');
    ar.firstChild.setAttribute('stroke', 'currentColor'); ar.firstChild.setAttribute('stroke-width', '2'); ar.firstChild.setAttribute('stroke-linecap', 'round'); ar.firstChild.setAttribute('stroke-linejoin', 'round');
    a.appendChild(ar);
    li.appendChild(a); $('links').appendChild(li);
  });

  // ---------- Typewriter ----------
  (function () {
    const el = $('bio'), lines = P.bio.length ? P.bio : [''];
    let li = 0, ci = 0, del = false;
    (function tick() {
      const s = lines[li];
      el.textContent = s.slice(0, ci);
      let t = del ? 35 : 80;
      if (!del && ci === s.length) { if (lines.length === 1) return; del = true; t = 1800; }
      else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; t = 300; }
      else ci += del ? -1 : 1;
      setTimeout(tick, t);
    })();
  })();

  // ---------- Hintergrund: Flow-Field ----------
  const start = performance.now();
  let W, H, dpr, parts = [], t = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: false, down: 0 };
  const spawn = () => ({ x: Math.random() * W, y: Math.random() * H, life: 100 + Math.random() * 200 });

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    ctx.fillStyle = '#03060c'; ctx.fillRect(0, 0, W, H);
    parts = Array.from({ length: Math.min(1400, Math.floor(innerWidth * innerHeight / 1400)) }, spawn);
    mouse.x = mouse.tx = W / 2; mouse.y = mouse.ty = H / 2;
  }
  addEventListener('resize', resize); resize();

  const angle = (x, y) => { const s = .0014 / dpr;
    return (Math.sin(x * s + t * .4) + Math.cos(y * s * 1.3 - t * .3) + Math.sin((x + y) * s * .7 + t * .2)) * 1.6; };

  function frame() {
    t += .006;
    mouse.x += (mouse.tx - mouse.x) * .12; mouse.y += (mouse.ty - mouse.y) * .12;
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(3,6,12,.09)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.1 * dpr;
    const R = 260 * dpr;
    for (const p of parts) {
      let a = angle(p.x, p.y), sp = 1.4 * dpr;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy), near = mouse.on && d < R;
      if (near) { const k = 1 - d / R; a = Math.atan2(dy, dx) + Math.PI / 2 + k; sp += k * 4.5 * dpr * (1 + mouse.down * 2); }
      const nx = p.x + Math.cos(a) * sp, ny = p.y + Math.sin(a) * sp, b = near ? .55 : .22;
      ctx.strokeStyle = `rgba(${140 + (b * 90) | 0},${205 + (b * 40) | 0},255,${b})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      if (--p.life < 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) Object.assign(p, spawn());
    }
    mouse.down *= .93;
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();

  // ---------- Maus / Tilt ----------
  function move(x, y) {
    mouse.tx = x * dpr; mouse.ty = y * dpr; mouse.on = true;
    dot.style.transform = glow.style.transform = `translate(${x}px, ${y}px)`;
  }
  let idle = performance.now();
  addEventListener('pointermove', e => { idle = performance.now(); move(e.clientX, e.clientY); });
  document.addEventListener('pointerleave', () => (mouse.on = false));
  addEventListener('pointerdown', () => { mouse.down = 1; dot.classList.add('big'); });
  addEventListener('pointerup', () => dot.classList.remove('big'));
  setInterval(() => {
    if (performance.now() - idle > 2500) {
      const s = performance.now() / 1000;
      move(innerWidth / 2 + Math.cos(s * .6) * innerWidth * .3, innerHeight / 2 + Math.sin(s * .9) * innerHeight * .25);
    }
  }, 30);

  // ---------- Enter ----------
  const music = $('music');
  $('enter').addEventListener('click', () => {
    $('enter').classList.add('out');
    stage.hidden = false;
    if (window.badgeStart) window.badgeStart();
    setTimeout(() => ($('enter').hidden = true), 950);
    if (P.music) { music.src = P.music; music.volume = .4; music.play().catch(() => {}); }
  });
})();
