for (const root of document.querySelectorAll('[data-part="logo-row"]')) {
  const track = root.querySelector('.stock-track'),
    list = track.firstElementChild;
  if (list.children.length < 6) continue;
  const copy = list.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  track.append(copy);
  function allowed() {
    return !frame.matches(':hover,:focus-within');
  }
  function reset() {}
  function still() {
    copy.hidden = true;
    delete frame.dataset.drift;
    track.style.transform = '';
  }
  function draw(t) {
    track.style.transform = 'translateX(' + (-50 * (t % 28000)) / 28000 + '%)';
  }
  function layout() {
    if (reduce.matches) still();
    else {
      copy.hidden = false;
      frame.dataset.drift = '';
    }
  }
  const frame = root.querySelector('.part-frame');
  const pause = frame.querySelector('.pause');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false,
    paused = false,
    last = 0,
    elapsed = 0,
    raf = 0;
  function tick(now) {
    elapsed += last ? now - last : 0;
    last = now;
    draw(elapsed);
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf);
    last = 0;
    pause.hidden = reduce.matches;
    if (reduce.matches) still();
    const running = visible && !paused && !reduce.matches && !document.hidden && allowed();
    frame.dataset.running = String(running);
    if (running) raf = requestAnimationFrame(tick);
  }
  pause.hidden = false;
  pause.onclick = () => {
    paused = !paused;
    pause.textContent = paused ? '▷' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Resume playback' : 'Pause playback');
    sync();
  };
  reduce.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !visible) reset();
    visible = entry.isIntersecting;
    sync();
  }).observe(frame);
  layout();
  reduce.addEventListener('change', layout);
  for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout'])
    frame.addEventListener(event, () => setTimeout(sync));
}
