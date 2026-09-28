// Ausweis am Band: Verlet-Seilphysik, per Maus/Touch greif- und schwingbar.
(() => {
  const $ = id => document.getElementById(id);
  const badge = $('badge'), rope = $('rope'), hint = $('hint'), ctx = rope.getContext('2d');
  const N = 9;                       // Seil-Segmente; Punkt N = Badge-Oberkante, N+1 = Badge-Mitte
  const GRAVITY = .9, DAMP = .992, ITER = 22, STEP = 1000 / 60;

  let W, H, dpr, bw, bh, ropeLen, total;
  let pts = null, lens = [], anchor = { x: 0, y: -30 };
  let drag = null, moved = false, ry = 0, acc = 0, last = 0;

  // Barcode aus dem Namen erzeugen
  (function barcode() {
    const svg = $('barcode'), NS = 'http://www.w3.org/2000/svg';
    let h = 2166136261;
    for (const ch of (window.PROFILE?.name || 'Grashalm03')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    let x = 0;
    while (x < 198) {
      h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
      const w = 1 + (h % 4), gap = 1 + ((h >>> 8) % 3);
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', 0); r.setAttribute('width', w); r.setAttribute('height', 30);
      svg.appendChild(r); x += w + gap;
    }
  })();

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    rope.width = W * dpr; rope.height = H * dpr;
  }

  function measure() {
    bw = badge.offsetWidth; bh = badge.offsetHeight;
    const narrow = W <= 820;
    const cx = narrow ? W / 2 : W * .29;              // Ausweis links, Inhalt rechts
    const cy = narrow ? H * .34 : H / 2;
    ropeLen = Math.max(70, Math.min(cy - bh / 2 + 30, H - bh - 20));
    const seg = ropeLen / N;
    lens = [0]; for (let i = 1; i <= N; i++) lens.push(seg);
    lens.push(bh / 2);
    total = ropeLen + bh / 2;
    anchor = { x: cx, y: -30 };
    document.documentElement.style.setProperty('--bx', (cx / W * 100).toFixed(1) + '%');
  }

  function start() {
    size(); measure();
    // Seil startet seitlich ausgelenkt und schwingt herein
    const th = (Math.random() < .5 ? -1 : 1) * 1.25;
    pts = []; let d = 0;
    for (let i = 0; i <= N + 1; i++) {
      d += lens[i];
      const x = anchor.x + Math.sin(th) * d, y = anchor.y + Math.cos(th) * d;
      pts.push({ x, y, px: x, py: y, w: i === 0 ? 0 : i === N + 1 ? .55 : 1 });
    }
    last = performance.now();
    requestAnimationFrame(loop);
  }

  addEventListener('resize', () => { if (!pts) return; size(); measure(); });

  function step(now) {
    const c = pts[N + 1];
    for (let i = 1; i <= N + 1; i++) {
      const p = pts[i];
      if (!p.w) continue;
      const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + GRAVITY;
    }
    c.x += Math.sin(now * .0011) * .05;   // leichte Brise

    if (drag) {
      // Ziel auf die Seillänge begrenzen, sanft nachziehen
      let dx = drag.tx - anchor.x, dy = drag.ty - anchor.y;
      const dist = Math.hypot(dx, dy), max = total * .998;
      if (dist > max) { dx *= max / dist; dy *= max / dist; }
      c.px = c.x; c.py = c.y;
      c.x += (anchor.x + dx - c.x) * .4;
      c.y += (anchor.y + dy - c.y) * .4;
    }

    for (let k = 0; k < ITER; k++) {
      for (let i = 1; i <= N + 1; i++) {
        const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || .0001, w = a.w + b.w;
        if (!w) continue;
        const diff = (dist - lens[i]) / dist / w;
        a.x += dx * diff * a.w; a.y += dy * diff * a.w;
        b.x -= dx * diff * b.w; b.y -= dy * diff * b.w;
      }
    }
    // im Bild halten
    c.x = Math.max(bw * .3, Math.min(W - bw * .3, c.x));
    c.y = Math.min(H - bh * .3, c.y);
  }

  function draw() {
    const a = pts[N], c = pts[N + 1];
    const dx = c.x - a.x, dy = c.y - a.y;
    const rot = -Math.atan2(dx, dy);
    ry += (Math.max(-40, Math.min(40, (c.x - c.px) * 3.2)) - ry) * .15;

    badge.style.transform =
      `translate3d(${c.x - bw / 2}px,${c.y - bh / 2}px,0) rotate(${rot}rad) perspective(900px) rotateY(${ry}deg)`;
    badge.style.setProperty('--sx', (50 + ry * 2.2 + rot * 70).toFixed(1) + '%');

    // Band zeichnen
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const path = () => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < N; i++) {
        const p = pts[i], q = pts[i + 1];
        ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
      }
      ctx.lineTo(a.x, a.y);
    };
    const bandW = Math.max(16, Math.min(26, bw * .085));
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(56,168,255,.55)'; ctx.shadowBlur = 18;
    path(); ctx.strokeStyle = '#0d3358'; ctx.lineWidth = bandW; ctx.stroke();
    ctx.shadowBlur = 0;
    path(); ctx.strokeStyle = 'rgba(159,220,255,.5)'; ctx.lineWidth = bandW; ctx.setLineDash([1.5, 9]); ctx.stroke(); ctx.setLineDash([]);
    path(); ctx.strokeStyle = 'rgba(217,242,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function loop(now) {
    acc += Math.min(now - last, STEP * 4); last = now;
    while (acc >= STEP) { step(now); acc -= STEP; }
    draw();
    requestAnimationFrame(loop);
  }

  // ---- Greifen & Ziehen ----
  badge.addEventListener('pointerdown', e => {
    if (!pts) return;
    const c = pts[N + 1];
    drag = { ox: e.clientX - c.x, oy: e.clientY - c.y, sx: e.clientX, sy: e.clientY, tx: c.x, ty: c.y };
    moved = false; c.w = 0;
    badge.classList.add('grab');
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    drag.tx = e.clientX - drag.ox; drag.ty = e.clientY - drag.oy;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) { moved = true; hint.classList.add('gone'); }
  });
  const release = () => {
    if (!drag) return;
    pts[N + 1].w = .55; drag = null; badge.classList.remove('grab');
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  // Nach einem Zieh-Vorgang keinen Link auslösen
  badge.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  window.badgeStart = start;
})();
