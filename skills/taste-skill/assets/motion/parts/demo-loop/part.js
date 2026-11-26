for (const root of document.querySelectorAll('[data-part="demo-loop"]')) {
  const template = root.querySelector('template');
  const pointer = root.querySelector('[data-pointer]');
  const defaults = {
    press: '[data-pointer]',
    type: '[data-text]',
    status: '[data-status]',
    row: '[data-row]',
    toast: '[data-toast]',
  };
  const steps = [...template.content.children]
    .map((step) => {
      const { action, target, at } = step.dataset;
      const selector = target || defaults[action];
      return {
        action,
        at: Number(at),
        text: step.textContent,
        target: selector ? root.querySelector(selector) : null,
      };
    })
    .sort((a, b) => a.at - b.at);
  const period = Math.min(14000, Math.max(8000, Number(template.dataset.cycle) || 10400));
  const restore = new Map();
  for (const step of steps)
    if (step.target && !restore.has(step.target)) restore.set(step.target, step.target.textContent);
  let previous = -1;
  function still() {
    for (const step of steps) {
      if (!step.target) continue;
      if (step.action === 'type' || step.action === 'status')
        step.target.textContent = restore.get(step.target);
      if (step.action === 'row' || step.action === 'toast') step.target.style.opacity = '1';
    }
    if (pointer) pointer.style.opacity = '0';
  }
  function reset() {
    elapsed = 0;
    previous = -1;
  }
  function allowed() {
    return true;
  }
  function draw(time) {
    const t = time % period;
    if (previous > t || previous < 0) {
      frame.dataset.reset = '';
      for (const step of steps) {
        if (!step.target) continue;
        if (step.action === 'type' || step.action === 'status')
          step.target.textContent = step.target.dataset.start || '';
        if (step.action === 'row' || step.action === 'toast') step.target.style.opacity = '0';
      }
      if (pointer) pointer.style.opacity = '0';
      frame.getBoundingClientRect(); // Commit the reset before the next timed step.
      delete frame.dataset.reset;
      previous = -1;
    }
    for (const { at, action, target, text } of steps) {
      if (at > t) break;
      if (!target) continue;
      if (action === 'type') {
        const value = text.slice(0, Math.floor((t - at) / 70));
        if (target.textContent !== value) target.textContent = value;
      }
      if (at <= previous) continue;
      switch (action) {
        case 'move': {
          if (!pointer) break;
          const box = target.getBoundingClientRect(),
            host = frame.getBoundingClientRect();
          pointer.style.opacity = '1';
          pointer.style.transform =
            'translate(' +
            (box.left - host.left + box.width * 0.68) +
            'px,' +
            (box.top - host.top + box.height * 0.55) +
            'px)';
          break;
        }
        case 'press':
          target.animate([{ backgroundColor: getComputedStyle(target).backgroundColor }, { backgroundColor: '#afc7ac' }, { backgroundColor: getComputedStyle(target).backgroundColor }], {
            duration: 180,
            easing: 'cubic-bezier(.4,0,.2,1)',
          });
          break;
        case 'status':
          target.textContent = text;
          break;
        case 'row':
          target.style.opacity = '1';
          break;
        case 'toast':
          target.style.opacity = '1';
          if (pointer) pointer.style.opacity = '0';
          break;
      }
    }
    previous = t;
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
  reduce.addEventListener('change', () => {
    reset();
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !visible) reset();
    visible = entry.isIntersecting;
    sync();
  }).observe(frame);
}
