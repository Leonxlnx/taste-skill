for (const root of document.querySelectorAll('[data-part="count-once"]')) {
  const figure = root.querySelector('[data-figure]'),
    end = Number(figure.dataset.figure),
    reduce = matchMedia('(prefers-reduced-motion:reduce)');
  if (!Number.isFinite(end) || reduce.matches) continue;
  let played = false,
    raf;
  const finish = () => {
    cancelAnimationFrame(raf);
    figure.textContent = String(end);
  };
  const observer = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) {
      if (played) finish();
      return;
    }
    if (played) return;
    played = true;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / 500);
      figure.textContent = String(Math.round(end * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else observer.disconnect();
    }
    if (!reduce.matches) raf = requestAnimationFrame(tick);
  });
  observer.observe(figure);
  reduce.addEventListener('change', () => {
    if (reduce.matches) finish();
  });
}
