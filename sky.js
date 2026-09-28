// Hintergrund: Vanta.js Wolken (three.js). Beim Betreten zoomt die Kamera aus dem Nebel heraus.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.getElementById('sky');
  let effect = null;
  try {
    effect = VANTA.CLOUDS({
      el, mouseControls: true, touchControls: true, gyroControls: false, minHeight: 200, minWidth: 200,
      backgroundColor: 0xc4dcf7, skyColor: 0x2a78dc, cloudColor: 0xdde9f8, cloudShadowColor: 0x163f78,
      sunColor: 0xffe9bd, sunGlareColor: 0x6fa8ee, sunlightColor: 0x9fc4f4,
      speed: reduce ? 0 : 1.1,
    });
  } catch (e) { document.body.classList.add('nogl'); }

  window.FX = {
    start() { el.classList.add('open'); },
    effect,
  };
})();
