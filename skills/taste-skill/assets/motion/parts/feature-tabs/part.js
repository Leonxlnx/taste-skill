for (const root of document.querySelectorAll('[data-part="feature-tabs"]')) {
  const frameTabs = root.querySelector('.plates'),
    choices = frameTabs.querySelector('[data-choices]');
  const buttons = [...choices.children],
    panels = [...frameTabs.querySelectorAll('figure')];
  let current = -1,
    chosen = false;
  choices.hidden = false;
  choices.setAttribute('role', 'tablist');
  choices.setAttribute('aria-label', 'Workshop editions');
  frameTabs.dataset.ready = '';
  const prefix = 'folio-tabs-' + [...document.querySelectorAll('[data-part=feature-tabs]')].indexOf(root);
  buttons.forEach((button, i) => {
    button.id = prefix + '-tab-' + i;
    panels[i].id = prefix + '-panel-' + i;
    button.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('aria-labelledby', button.id);
  });
  function select(index) {
    if (index === current) return;
    current = index;
    buttons.forEach((button, i) => {
      const active = i === index;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', active);
      button.tabIndex = active ? 0 : -1;
      button.style.setProperty('--progress', 0);
      panels[i].style.opacity = active ? 1 : 0;
      panels[i].inert = !active;
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-label', button.textContent);
    });
  }
  function still() {
    select(current < 0 ? 0 : current);
  }
  function reset() {}
  function allowed() {
    return !chosen && !root.matches(':hover,:focus-within');
  }
  function draw(t) {
    select(Math.floor(t / 4800) % buttons.length);
    buttons[current].style.setProperty('--progress', (t % 4800) / 4800);
  }
  select(0);
  buttons.forEach((button, i) => {
    button.onclick = () => {
      chosen = true;
      select(i);
      sync();
      pause.hidden = true;
    };
    button.onkeydown = (e) => {
      const next = {
        ArrowRight: (i + 1) % buttons.length,
        ArrowLeft: (i + buttons.length - 1) % buttons.length,
        Home: 0,
        End: buttons.length - 1,
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      buttons[next].focus();
      buttons[next].click();
    };
  });
  for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout'])
    root.addEventListener(event, () => setTimeout(sync));
  const frame = root.querySelector('.part-frame');
  const pause = frame.querySelector('.pause');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false,
    paused = root.dataset.playback === 'manual',
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
    pause.hidden = reduce.matches || chosen;
    if (reduce.matches) still();
    const running = visible && !paused && !reduce.matches && !document.hidden && allowed();
    frame.dataset.running = String(running);
    if (running) raf = requestAnimationFrame(tick);
  }
  if (paused) { pause.textContent = '▷'; pause.setAttribute('aria-label','Start playback'); }
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
}
