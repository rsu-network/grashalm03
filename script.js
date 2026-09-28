(() => {
  const P = window.PROFILE;
  const $ = id => document.getElementById(id);
  const dot = $('dot'), stage = $('stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (window.MOUSE = { x: -9999, y: -9999, last: -1e9 });

  // ---------- Inhalt aus config.js ----------
  document.title = P.name;
  if (P.role) $('role').textContent = P.role;
  const m = P.name.match(/^(.*?)(\d+)$/);
  const setBadgeName = () => { const el = $('badgeName'); el.textContent = ''; el.append(m ? m[1] : P.name);
    if (m) { const s = document.createElement('span'); s.textContent = m[2]; el.append(s); } };
  setBadgeName();

  // Titel: jeder Buchstabe ein eigener Halm
  const title = $('name'); title.setAttribute('aria-label', P.name);
  const letters = [];
  [...P.name].forEach((ch, i) => {
    const w = document.createElement('span'); w.className = 'ch'; w.setAttribute('aria-hidden', 'true'); w.style.setProperty('--i', i);
    if (m && i >= m[1].length) w.classList.add('acc');
    const s = document.createElement('span'); s.className = 'sw'; s.textContent = ch; w.appendChild(s); title.appendChild(w);
    letters.push({ w, s, i, ch });
    if (!reduce) {   // Buchstaben "entschlüsseln" sich
      const pool = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+';
      setTimeout(() => { const end = performance.now() + 520;
        const id = setInterval(() => { if (performance.now() > end) { s.textContent = ch; clearInterval(id); } else s.textContent = pool[(Math.random() * pool.length) | 0]; }, 45); }, 250 + i * 65 + 1500);
    }
  });

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
    a.title = l.label; a.draggable = false;
    if (l.url !== '#') a.target = '_blank';
    const ic = document.createElement('span'); ic.className = 'ic'; ic.appendChild(svg(ICONS[l.icon] || ICONS.link)); a.appendChild(ic);
    const t = document.createElement('span'); t.className = 'lb'; t.textContent = l.label; a.appendChild(t);
    if (l.handle) { const h = document.createElement('span'); h.className = 'hd'; h.textContent = l.handle; a.appendChild(h); }
    const ar = svg('M9 5l7 7-7 7'); ar.classList.add('arrow');
    const p = ar.firstChild; p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    a.appendChild(ar);
    a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect();
      a.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg');
      a.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 10).toFixed(2) + 'deg'); });
    a.addEventListener('pointerleave', () => { a.style.setProperty('--rx', '0deg'); a.style.setProperty('--ry', '0deg'); });
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

  // ---------- Buchstaben biegen sich im Wind wie Halme ----------
  let tt = 0;
  function sway() {
    tt += .016;
    const active = performance.now() - M.last < 2600;
    for (const L of letters) {
      const r = L.w.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height;
      const A = window.AUDIO, since = performance.now() - (A ? A.beatT : -1e9);
      let rot = Math.sin(tt * 1.5 + L.i * .55) * 1.6, lift = Math.sin(tt * 1.1 + L.i * .8) * 1.5, sc = 1;
      if (A) { lift -= Math.exp(-since / 240) * 18 * (.55 + .45 * Math.sin(L.i * 1.1)) + A.bass * 5; rot += Math.sin(L.i + tt * 3) * A.mid * 4; sc += A.bass * .05; }
      if (active) {
        const dx = cx - M.x, dy = cy - M.y, near = Math.exp(-(dx * dx + dy * dy) / (2 * 150 * 150));
        rot += Math.sign(dx || 1) * Math.min(1, Math.abs(dx) / 50) * near * 15;
        lift -= near * 10; sc += near * .06;
      }
      L.s.style.transform = `translateY(${lift.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scaleY(${sc.toFixed(3)})`;
    }
    if (!reduce) requestAnimationFrame(sway);
  }

  // ---------- Maus ----------
  addEventListener('pointermove', e => {
    M.x = e.clientX; M.y = e.clientY; M.last = performance.now();
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  addEventListener('pointerdown', e => {
    dot.classList.add('big');
    if (reduce) return;
    const r = document.createElement('i'); r.className = 'ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    document.body.appendChild(r); r.addEventListener('animationend', () => r.remove());
  });
  addEventListener('pointerup', () => dot.classList.remove('big'));

  // ---------- Enter: Wolkendecke reißt auf ----------
  $('enter').addEventListener('click', () => {
    $('enter').classList.add('out');
    if (window.FX) FX.start();
    setTimeout(() => {
      stage.hidden = false;
      if (window.badgeStart) window.badgeStart();
      requestAnimationFrame(sway);
    }, reduce ? 0 : 1500);
    setTimeout(() => ($('enter').hidden = true), 900);
    if (P.music && window.AudioFX) AudioFX.start(P.music);
  });
})();
