/*
  marquee-row - one row of client words, trades, cities or logos moves slowly sideways in a loop,
  fading out at both edges; it pauses while pointed at, runs only while on screen, and carries a
  pause button (it runs on its own for longer than 5 s). Under reduced motion and without script the
  words stand in a wrapped row.

    <div data-moment="marquee-row" data-moment-opts='{"speed": 36}'>
      <ul class="mo-mq__track"><li>Studios</li><li>Agencies</li>…</ul>      6 to 14 items; logos as <img>
    </div>

  opts: speed px/s (36, 16-80), gap px between items (64).
*/
export default function (root, opts, lib) {
  const track = root.querySelector('.mo-mq__track') || root.firstElementChild;
  if (!track) return {};
  root.classList.add('mo-mq');
  root.style.setProperty('--mo-gap', `${Math.max(24, +opts.gap || 64)}px`);
  if (lib.reduced() || track.children.length < 2) { root.classList.add('is-still'); return {}; }
  const speed = lib.clamp(+opts.speed || 36, 16, 80);
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('mo-mq__clone');
  const rail = document.createElement('div');       // the masked part: the track and its copy
  rail.className = 'mo-mq__rail';
  track.replaceWith(rail);
  rail.append(track, clone);
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'loop-pause mo-mq__pause';
  const icon = on => `<svg viewBox="0 0 14 14" aria-hidden="true">${on ? '<path d="M3 2h3v10H3zM8 2h3v10H8z"/>' : '<path d="M4 2l8 5-8 5z"/>'}</svg>`;
  const setPaused = p => { root.classList.toggle('is-paused', p); pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); pause.innerHTML = icon(!p); };
  setPaused(false);
  pause.addEventListener('click', () => setPaused(!root.classList.contains('is-paused')));
  root.append(pause);
  root.classList.add('is-live');
  const fit = () => { const w = track.scrollWidth; root.style.setProperty('--mo-w', `${w}px`); root.style.setProperty('--mo-dur', `${(w / speed).toFixed(2)}s`); };
  fit();
  lib.fontsReady().then(fit);
  const ro = new ResizeObserver(fit);
  ro.observe(track);
  const io = new IntersectionObserver(es => root.classList.toggle('is-on', es[es.length - 1].isIntersecting));
  io.observe(root);
  return { destroy() { ro.disconnect(); io.disconnect(); clone.remove(); pause.remove(); rail.replaceWith(track); root.classList.remove('is-live', 'is-on', 'is-paused'); } };
}
