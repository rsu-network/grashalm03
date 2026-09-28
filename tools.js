// "Tools coming soon" + Geschenk: zeigt, was jede Website über Besucher auslesen kann.
// Alles wird nur im Browser gelesen. Einzige externe Abfrage: die IP (ipwho.is), und nur nach Klick auf das Geschenk.
(() => {
  const $ = id => document.getElementById(id);
  const gift = $('gift'), info = $('info'), grid = $('infoGrid'), closeBtn = $('infoX'), copyBtn = $('infoCopy');
  let built = false, lastFocus = null, report = {};

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); }

  function gpu() {
    try {
      const gl = document.createElement('canvas').getContext('webgl'); const e = gl.getExtension('WEBGL_debug_renderer_info');
      return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (err) { return 'nicht auslesbar'; }
  }

  function refreshRate() {
    return new Promise(res => {
      let n = 0, t0 = 0;
      const f = t => { if (!t0) t0 = t; if (++n >= 40) res(Math.round(1000 / ((t - t0) / (n - 1)))); else requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
  }

  const mq = q => matchMedia(q).matches;

  function sections() {
    const n = navigator, s = screen, c = n.connection || {};
    const nl = (n.languages || [n.language]).join(', ');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const gp = gpu();
    const fp = fnv([n.userAgent, nl, s.width, s.height, s.colorDepth, devicePixelRatio, tz, gp, n.hardwareConcurrency, n.deviceMemory].join('|'));
    return [
      ['Netzwerk', [
        ['IP-Adresse', '…', 'ip'], ['Ungefährer Ort', '…', 'loc'], ['Provider', '…', 'isp'],
        ['Zeitzone', tz], ['Verbindung', c.effectiveType ? `${c.effectiveType} · ${c.downlink || '?'} Mbit/s · ${c.rtt || '?'} ms` : 'nicht verfügbar'],
        ['Datensparmodus', c.saveData ? 'an' : 'aus'], ['Online', n.onLine ? 'ja' : 'nein'],
      ]],
      ['Monitor', [
        ['Auflösung', `${s.width} × ${s.height}`], ['Nutzbarer Bereich', `${s.availWidth} × ${s.availHeight}`],
        ['Fenstergröße', `${innerWidth} × ${innerHeight}`], ['Pixeldichte', `${devicePixelRatio}×`],
        ['Farbtiefe', `${s.colorDepth} Bit`], ['Bildwiederholrate', '…', 'hz'],
        ['HDR', mq('(dynamic-range: high)') ? 'ja' : 'nein'], ['Farbraum', mq('(color-gamut: rec2020)') ? 'Rec.2020' : mq('(color-gamut: p3)') ? 'Display-P3' : 'sRGB'],
        ['Ausrichtung', (s.orientation && s.orientation.type) || (innerWidth > innerHeight ? 'landscape' : 'portrait')], ['Touch-Punkte', String(n.maxTouchPoints || 0)],
      ]],
      ['Gerät', [
        ['System', (n.userAgentData && n.userAgentData.platform) || n.platform || '?'], ['CPU-Threads', String(n.hardwareConcurrency || '?')],
        ['Arbeitsspeicher ≈', n.deviceMemory ? `${n.deviceMemory} GB` : 'nicht verfügbar'], ['Grafikkarte', gp], ['Akku', '…', 'bat'],
      ]],
      ['Browser', [
        ['Browser-Kennung', n.userAgent], ['Sprachen', nl], ['Cookies erlaubt', n.cookieEnabled ? 'ja' : 'nein'],
        ['Do Not Track', n.doNotTrack === '1' ? 'an' : 'aus / nicht gesetzt'], ['Farbschema', mq('(prefers-color-scheme: dark)') ? 'dunkel' : 'hell'],
        ['Weniger Bewegung', mq('(prefers-reduced-motion: reduce)') ? 'ja' : 'nein'],
      ]],
      ['Wiedererkennung', [
        ['Fingerprint (Kurzform)', fp], ['Woher du kamst', document.referrer || 'direkt (kein Referrer)'], ['Lokale Uhrzeit', new Date().toLocaleString('de-DE')],
      ]],
    ];
  }

  function build() {
    grid.textContent = ''; report = {};
    sections().forEach(([title, rows]) => {
      const box = document.createElement('section'); box.className = 'ig';
      box.innerHTML = '<h3>' + esc(title) + '</h3><dl></dl>';
      const dl = box.querySelector('dl');
      rows.forEach(([k, v, id]) => {
        const row = document.createElement('div');
        row.innerHTML = '<dt>' + esc(k) + '</dt><dd' + (id ? ' data-k="' + id + '"' : '') + '>' + esc(v) + '</dd>';
        dl.appendChild(row); report[k] = v;
      });
      grid.appendChild(box);
    });
    built = true;
    fill();
  }

  function set(id, text) { const el = grid.querySelector('[data-k="' + id + '"]'); if (el) { el.textContent = text; const k = el.previousElementSibling.textContent; report[k] = text; } }

  async function fill() {
    refreshRate().then(hz => set('hz', hz + ' Hz (gemessen)'));
    if (navigator.getBattery) navigator.getBattery().then(b => set('bat', Math.round(b.level * 100) + ' % · ' + (b.charging ? 'lädt' : 'nicht am Netz'))).catch(() => set('bat', 'nicht verfügbar'));
    else set('bat', 'nicht verfügbar');
    try {
      const r = await fetch('https://ipwho.is/', { cache: 'no-store' }); const j = await r.json();
      if (!j.success) throw new Error('fail');
      set('ip', j.ip + (j.type ? ' (' + j.type + ')' : ''));
      set('loc', [j.city, j.region, j.country].filter(Boolean).join(', '));
      set('isp', (j.connection && (j.connection.isp || j.connection.org)) || 'unbekannt');
    } catch (e) { set('ip', 'nicht abrufbar (Blocker?)'); set('loc', 'nicht abrufbar'); set('isp', 'nicht abrufbar'); }
  }

  function open() {
    lastFocus = document.activeElement;
    gift.classList.add('pop');
    setTimeout(() => gift.classList.remove('pop'), 700);
    setTimeout(() => { info.hidden = false; requestAnimationFrame(() => info.classList.add('in')); closeBtn.focus(); if (!built) build(); else { built = false; build(); } }, 380);
  }
  function close() {
    info.classList.remove('in');
    setTimeout(() => { info.hidden = true; if (lastFocus) lastFocus.focus(); }, 300);
  }

  gift.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  info.addEventListener('click', e => { if (e.target === info) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !info.hidden) close(); });
  copyBtn.addEventListener('click', async () => {
    const text = Object.entries(report).map(([k, v]) => k + ': ' + v).join('\n');
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = 'Kopiert'; } catch (e) { copyBtn.textContent = 'Nicht möglich'; }
    setTimeout(() => (copyBtn.textContent = 'Alles kopieren'), 1600);
  });
})();
