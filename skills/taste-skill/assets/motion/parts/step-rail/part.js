for (const root of document.querySelectorAll('[data-part="step-rail"]')) {
  const rail = root.querySelector('.reading-rail'),
    screen = rail.querySelector('.rail-screen'),
    items = [...rail.querySelectorAll('article')];
  const photos = items.map((a) => a.querySelector('img').cloneNode());
  screen.append(...photos);
  rail.dataset.ready = '';
  function update() {
    let active = 0;
    items.forEach((a, i) => {
      if (a.getBoundingClientRect().top < innerHeight * 0.48) active = i;
    });
    items.forEach((a, i) => {
      if (i === active) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
      photos[i].style.opacity = i === active ? 1 : 0;
    });
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      update();
    });
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}
