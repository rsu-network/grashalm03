// Musik über den YouTube-Player (versteckt). Startet beim Klick auf "Betreten", Knopf oben rechts schaltet an/aus.
(() => {
  const $ = id => document.getElementById(id);
  const snd = $('snd');
  const vol = $('vol');
  let player = null, ready = false, wantPlay = false, playing = false, volume = 60;
  try { const v = parseInt(localStorage.getItem('gh-vol'), 10); if (v >= 0 && v <= 100) volume = v; } catch (e) { /* ohne Speicher weiter */ }
  vol.value = volume; vol.style.setProperty('--v', volume + '%');

  function setBtn() { snd.classList.toggle('off', !playing); snd.setAttribute('aria-pressed', String(playing)); }

  function load(id) {
    const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player('yt', {
        host: 'https://www.youtube-nocookie.com', width: '200', height: '200', videoId: id,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, loop: 1, playlist: id, playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
        events: {
          onReady: () => { ready = true; player.setVolume(volume); if (wantPlay) player.playVideo(); },
          onStateChange: e => { playing = e.data === YT.PlayerState.PLAYING; setBtn(); },
        },
      });
    };
  }

  window.AudioFX = {
    init(id) { if (id) load(id); },
    start() { wantPlay = true; if (ready) player.playVideo(); },
    toggle() {
      wantPlay = true;
      if (!ready) return;
      if (playing) player.pauseVideo(); else player.playVideo();
    },
  };
  vol.addEventListener('input', () => {
    volume = +vol.value; vol.style.setProperty('--v', volume + '%');
    if (ready) { player.setVolume(volume); if (volume > 0 && player.isMuted()) player.unMute(); }
    try { localStorage.setItem('gh-vol', String(volume)); } catch (e) { /* egal */ }
  });
  snd.addEventListener('click', e => { e.stopPropagation(); AudioFX.toggle(); });
  setBtn();
  AudioFX.init(window.PROFILE && window.PROFILE.music);
})();
