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
    letters.push({ w, s, i });
  });

  const ICONS = {
    steam: 'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z',
    modrinth: 'M12.252.004a11.78 11.768 0 0 0-8.92 3.73 11 10.999 0 0 0-2.17 3.11 11.37 11.359 0 0 0-1.16 5.169c0 1.42.17 2.5.6 3.77.24.759.77 1.899 1.17 2.529a12.3 12.298 0 0 0 8.85 5.639c.44.05 2.54.07 2.76.02.2-.04.22.1-.26-1.7l-.36-1.37-1.01-.06a8.5 8.489 0 0 1-5.18-1.8 5.34 5.34 0 0 1-1.3-1.26c0-.05.34-.28.74-.5a37.572 37.545 0 0 1 2.88-1.629c.03 0 .5.45 1.06.98l1 .97 2.07-.43 2.06-.43 1.47-1.47c.8-.8 1.48-1.5 1.48-1.52 0-.09-.42-1.63-.46-1.7-.04-.06-.2-.03-1.02.18-.53.13-1.2.3-1.45.4l-.48.15-.53.53-.53.53-.93.1-.93.07-.52-.5a2.7 2.7 0 0 1-.96-1.7l-.13-.6.43-.57c.68-.9.68-.9 1.46-1.1.4-.1.65-.2.83-.33.13-.099.65-.579 1.14-1.069l.9-.9-.7-.7-.7-.7-1.95.54c-1.07.3-1.96.53-1.97.53-.03 0-2.23 2.48-2.63 2.97l-.29.35.28 1.03c.16.56.3 1.16.31 1.34l.03.3-.34.23c-.37.23-2.22 1.3-2.84 1.63-.36.2-.37.2-.44.1-.08-.1-.23-.6-.32-1.03-.18-.86-.17-2.75.02-3.73a8.84 8.839 0 0 1 7.9-6.93c.43-.03.77-.08.78-.1.06-.17.5-2.999.47-3.039-.01-.02-.1-.02-.2-.03Zm3.68.67c-.2 0-.3.1-.37.38-.06.23-.46 2.42-.46 2.52 0 .04.1.11.22.16a8.51 8.499 0 0 1 2.99 2 8.38 8.379 0 0 1 2.16 3.449 6.9 6.9 0 0 1 .4 2.8c0 1.07 0 1.27-.1 1.73a9.37 9.369 0 0 1-1.76 3.769c-.32.4-.98 1.06-1.37 1.38-.38.32-1.54 1.1-1.7 1.14-.1.03-.1.06-.07.26.03.18.64 2.56.7 2.78l.06.06a12.07 12.058 0 0 0 7.27-9.4c.13-.77.13-2.58 0-3.4a11.96 11.948 0 0 0-5.73-8.578c-.7-.42-2.05-1.06-2.25-1.06Z',
    xbox: 'M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.223.021-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z',
    discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
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

  // ---------- Name: Dock-Vergrößerung am Cursor + wandernde Lichtwelle ----------
  let tt = 0;
  const widths = [];
  function sway() {
    tt += .016;
    const active = performance.now() - M.last < 2600;
    const tr = title.getBoundingClientRect();
    const my = M.y, inBand = active && my > tr.top - 90 && my < tr.bottom + 90;
    if (!widths.length) letters.forEach(L => widths.push(L.w.offsetWidth));
    const sc = letters.map(L => {
      if (!inBand) return 1;
      const r = L.w.getBoundingClientRect(), cx = r.left + r.width / 2, d = cx - M.x;
      return 1 + .62 * Math.exp(-(d * d) / (2 * 85 * 85));
    });
    let acc = 0;
    letters.forEach((L, i) => {
      const s = sc[i], x = acc + (s - 1) * widths[i] / 2; acc += (s - 1) * widths[i];
      const glow = Math.pow(Math.max(0, Math.sin(tt * 1.3 - i * .55)), 8);
      L.s.style.transform = `translateX(${x.toFixed(1)}px) translateY(${(-glow * 3).toFixed(1)}px) scale(${s.toFixed(3)})`;
      L.s.style.color = glow > .05 || s > 1.05 ? `color-mix(in srgb, var(--accent) ${Math.round(Math.max(glow, (s - 1) * 1.4) * 100)}%, currentColor)` : '';
    });
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



  // ---------- QR-Code, Gender, Abzeichen ----------
  (function () {
    if (P.qr && window.qrcode) {
      const q = qrcode(0, 'M'); q.addData(P.qr); q.make();
      const n = q.getModuleCount(), pad = 2; let d = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + pad) + ' ' + (r + pad) + 'h1v1h-1z';
      $('qr').innerHTML = '<svg viewBox="0 0 ' + (n + pad * 2) + ' ' + (n + pad * 2) + '" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#062a52"/></svg>';
    } else $('qr').closest('.qrwrap').hidden = true;

    const BI = {
      mug: 'M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9ZM16 11h2a2 2 0 0 1 0 4h-2M8 3.5v2M12 3.5v2',
      bolt: 'M13 3 5 13.5h6L10 21l9-11h-6.5L13 3Z',
      verified: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3ZM9 12l2 2 4-4',
      coder: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12',
      gamer: 'M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14.5 14.5h-5L8.2 16A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4ZM8 11.5v3M6.5 13h3M15.5 12.5h.01M17.5 14h.01',
      creator: 'M4 6h16v12H4ZM10 9.5v5l4.5-2.5Z',
      star: 'M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8-4.2-4.1 5.8-.8Z',
    };
    ['badgesPanel'].forEach(id => {
      const box = $(id);
      (P.badges || []).forEach(b => {
        const s = document.createElement('span'); s.className = 'bdg'; s.dataset.tip = b.label; s.setAttribute('role', 'img'); s.setAttribute('aria-label', b.label);
        const v = document.createElementNS(NS, 'svg'); v.setAttribute('viewBox', '0 0 24 24'); v.setAttribute('aria-hidden', 'true');
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', BI[b.icon] || BI.star); v.appendChild(p); s.appendChild(v); const l = document.createElement('span'); l.className = 'lbl'; l.textContent = b.label; s.appendChild(l); box.appendChild(s);
      });
    });
  })();


  // ---------- Ortszeit & Wetter München ----------
  (function () {
    const clock = $('clock');
    const fmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 1000);

    const I = {
      sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
      moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
      cloud: 'M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.2 4.4 4.4 0 0 0 7 18Z',
      part: 'M8.5 9.5a3 3 0 1 1 5.3-1.9M11 2.5v1.2M4.3 5.3l.9.9M2.5 10h1.2M8 21h9a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.2 14.2 3.4 3.4 0 0 0 8 21Z',
      rain: 'M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 5.2 4.4 4.4 0 0 0 7 14ZM8 17l-1 3M12 17l-1 3M16 17l-1 3',
      snow: 'M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 5.2 4.4 4.4 0 0 0 7 14ZM8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01',
      storm: 'M7 14h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 5.2 4.4 4.4 0 0 0 7 14ZM13 15l-3 4h3l-2 3',
      fog: 'M4 8h16M6 12h12M4 16h16M8 20h8',
    };
    function decode(code, day) {
      if (code === 0) return [day ? 'sun' : 'moon', 'Klar'];
      if (code === 1) return [day ? 'sun' : 'moon', 'Überwiegend klar'];
      if (code === 2) return ['part', 'Teils bewölkt'];
      if (code === 3) return ['cloud', 'Bedeckt'];
      if (code === 45 || code === 48) return ['fog', 'Nebel'];
      if (code >= 51 && code <= 57) return ['rain', 'Nieselregen'];
      if (code >= 61 && code <= 67) return ['rain', 'Regen'];
      if (code >= 71 && code <= 77) return ['snow', 'Schnee'];
      if (code >= 80 && code <= 82) return ['rain', 'Schauer'];
      if (code === 85 || code === 86) return ['snow', 'Schneeschauer'];
      if (code >= 95) return ['storm', 'Gewitter'];
      return ['cloud', 'Wolkig'];
    }
    async function weather() {
      try {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.1374&longitude=11.5755&current=temperature_2m,weather_code,is_day&timezone=Europe%2FBerlin');
        const c = (await r.json()).current; if (!c) return;
        const [ic, txt] = decode(c.weather_code, c.is_day === 1);
        const box = $('wxIcon'); box.textContent = '';
        const v = document.createElementNS(NS, 'svg'); v.setAttribute('viewBox', '0 0 24 24'); v.setAttribute('aria-hidden', 'true');
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', I[ic]); v.appendChild(p); box.appendChild(v); box.hidden = false;
        $('wxText').textContent = Math.round(c.temperature_2m) + '° · ' + txt;
      } catch (e) { console.warn('weather failed:', e && e.message); }
    }
    weather(); setInterval(weather, 15 * 60 * 1000);
  })();

  // ---------- Discord-Status (Lanyard) ----------
  const STATUS = { online: ['Online', '#23a559'], idle: ['Abwesend', '#f0b232'], dnd: ['Bitte nicht stören', '#f23f43'], offline: ['Offline', '#80848e'] };
  function makePres() {
    const d = document.createElement('div'); d.className = 'pres';
    d.innerHTML = '<span class="pav"><img alt="" draggable="false"><i class="sd"></i></span><span class="ptx"><b class="pn"></b><span class="pt"></span></span>';
    return d;
  }
  const presBoxes = [makePres(), makePres()];
  $('presence').appendChild(presBoxes[0]); $('backPres').appendChild(presBoxes[1]);

  function activityText(d) {
    if (d.listening_to_spotify && d.spotify) return 'Hört ' + d.spotify.song + ' – ' + d.spotify.artist;
    const acts = (d.activities || []).filter(a => a.type !== 4);
    if (acts[0]) return (acts[0].type === 0 ? 'Spielt ' : '') + acts[0].name;
    const custom = (d.activities || []).find(a => a.type === 4);
    return custom && custom.state ? custom.state : '';
  }
  function showPresence(d) {
    const u = d.discord_user || {}, st = STATUS[d.discord_status] || STATUS.offline;
    const name = u.global_name || u.username || P.name;
    const avatar = u.avatar ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=128' : '';
    const act = activityText(d);
    presBoxes.forEach(b => {
      const img = b.querySelector('img'); if (avatar) img.src = avatar; else img.removeAttribute('src');
      b.querySelector('.pn').textContent = name;
      b.querySelector('.pt').textContent = act || st[0];
      b.querySelector('.sd').style.background = st[1];
    });
    $('presence').hidden = false; $('bkDisc').hidden = false;
    const sf = $('stFront'); sf.hidden = false;
    sf.querySelector('.sd').style.background = st[1]; sf.querySelector('span').textContent = st[0];
  }
  async function pollDiscord() {
    if (!P.discordId) return;
    try {
      const r = await fetch('https://api.lanyard.rest/v1/users/' + P.discordId, { cache: 'no-store' });
      const j = await r.json();
      if (j && j.success) showPresence(j.data);
    } catch (e) { /* Status bleibt versteckt */ }
  }
  pollDiscord(); setInterval(pollDiscord, 30000);

  // ---------- Tab-Titel: tippt sich, reagiert auf Tab-Wechsel ----------
  (function () {
    if (reduce) return;
    const words = [P.name.toLowerCase(), P.role ? P.role.toLowerCase() : '', 'grashalm03.top'].filter(Boolean);
    let wi = 0, ci = 0, del = false, timer = 0;
    function tick() {
      const w = words[wi];
      document.title = (w.slice(0, ci) || '‎') + (ci < w.length || del ? '_' : '');
      let t = del ? 55 : 140;
      if (!del && ci === w.length) { del = true; t = 2600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; t = 500; }
      else ci += del ? -1 : 1;
      timer = setTimeout(tick, t);
    }
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timer);
      if (document.hidden) document.title = 'komm zurück…';
      else { ci = 0; del = false; tick(); }
    });
    let started = false;
    $('enter').addEventListener('click', () => { if (!started) { started = true; tick(); } });
  })();

  // ---------- Enter: Wolkendecke reißt auf ----------
  $('enter').addEventListener('click', () => {
    $('enter').classList.add('out');
    if (window.FX) FX.start();
    setTimeout(() => {
      stage.hidden = false;
      stage.classList.add('lock'); setTimeout(() => stage.classList.remove('lock'), 2000);   // Doppelklick beim Betreten darf nichts auslösen
      if (window.badgeStart) window.badgeStart();
      requestAnimationFrame(sway);
    }, reduce ? 0 : 1500);
    setTimeout(() => ($('enter').hidden = true), 900);
    if (P.music && window.AudioFX) AudioFX.start();
  });
})();
