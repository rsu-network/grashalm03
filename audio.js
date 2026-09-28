// Musik + Audio-Analyse. Liefert window.AUDIO (bass/mid/high, Beat-Zähler) und zeichnet den Equalizer.
(() => {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const A = (window.AUDIO = { bass: 0, mid: 0, high: 0, beatN: 0, beatT: -1e9, playing: false });
  const eq = $('eq'), ex = eq.getContext('2d'), snd = $('snd'), flash = $('flash');
  let el, actx, an, data, dpr = 1, ew = 0, eh = 0, avg = .2, lastBeat = 0, hasAnalyser = false;
  const BPM = 128;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); ew = innerWidth; eh = innerWidth < 820 ? 44 : 84;
    eq.width = ew * dpr; eq.height = eh * dpr; eq.style.height = eh + 'px';
  }
  addEventListener('resize', resize); resize();

  function setBtn() { snd.classList.toggle('off', !A.playing); snd.setAttribute('aria-pressed', String(A.playing)); }

  function beat(now, strength) {
    A.beatN++; A.beatT = now;
    if (window.badgeKick) badgeKick((Math.random() - .5) * 16 * strength, 9 * strength);
    if (!reduce && flash.animate) flash.animate([{ opacity: .1 * strength }, { opacity: 0 }], { duration: 480, easing: 'ease-out' });
  }

  function loop(now) {
    const playing = el && !el.paused && !el.ended;
    A.playing = !!playing;
    let bass = 0, mid = 0, high = 0;
    if (playing && hasAnalyser) {
      an.getByteFrequencyData(data);
      const m = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += data[i]; return s / (b - a) / 255; };
      bass = m(1, 6); mid = m(7, 40); high = m(41, 120);
      if (bass > avg * 1.28 && bass > .48 && now - lastBeat > 280) { lastBeat = now; beat(now, Math.min(1.4, bass * 1.5)); }
      avg = avg * .96 + bass * .04;
    } else if (playing) {                       // Fallback ohne Analyse: Takt aus der Abspielzeit
      const ph = (el.currentTime * BPM / 60) % 1;
      bass = Math.pow(1 - ph, 3) * .8; mid = .3 + .2 * Math.sin(now / 300); high = .2;
      if (Math.floor(el.currentTime * BPM / 60) !== Math.floor((el.currentTime - .017) * BPM / 60)) beat(now, 1);
    }
    A.bass = Math.max(bass, A.bass * .86); A.mid += (mid - A.mid) * .2; A.high += (high - A.high) * .2;
    document.documentElement.style.setProperty('--bass', A.bass.toFixed(3));
    drawEq(now, playing);
    setBtn();
    requestAnimationFrame(loop);
  }

  function drawEq(now, playing) {
    ex.setTransform(dpr, 0, 0, dpr, 0, 0); ex.clearRect(0, 0, ew, eh);
    if ($('stage').hidden) return;
    const n = Math.min(96, Math.floor(ew / 12)), bw = ew / n;
    for (let i = 0; i < n; i++) {
      let v;
      if (playing && hasAnalyser) { const k = Math.floor(Math.pow(i / n, 1.6) * 110) + 1; v = Math.pow(data[k] / 255, 1.5); }
      else if (playing) v = .25 + .5 * Math.abs(Math.sin(now / 180 + i * .5)) * (.4 + A.bass);
      else v = .05 + .04 * Math.sin(now / 900 + i * .4);
      const h = Math.max(3, v * eh);
      ex.fillStyle = 'rgba(6,42,82,.55)'; ex.fillRect(i * bw + bw * .18, eh - h, bw * .64, h);
      ex.fillStyle = 'rgba(255,255,255,.95)'; ex.fillRect(i * bw + bw * .18, eh - h, bw * .64, 2);
    }
  }

  window.AudioFX = {
    start(src) {
      if (!src) return;
      el = $('music'); el.src = src; el.volume = .6;
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        const s = actx.createMediaElementSource(el);
        an = actx.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = .8;
        s.connect(an); an.connect(actx.destination);
        data = new Uint8Array(an.frequencyBinCount); hasAnalyser = true;
        actx.resume();
      } catch (e) { hasAnalyser = false; }
      el.play().catch(() => {});
    },
    toggle() { if (!el) return; if (el.paused) { actx && actx.resume(); el.play(); } else el.pause(); },
  };
  snd.addEventListener('click', e => { e.stopPropagation(); AudioFX.toggle(); });
  requestAnimationFrame(loop);
})();
