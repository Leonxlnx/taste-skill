// The text stays in reading order. Only the illustration column follows the reader.
export function chapterFrame(root, steps, figures, frame) {
  const wide = matchMedia('screen and (min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
  const homes = figures.map(figure => {
    const marker = document.createComment('chapter picture');
    figure.before(marker);
    return marker;
  });
  let tick = 0;
  function select() {
    tick = 0;
    const index = Math.max(0, steps.findLastIndex(step => step.getBoundingClientRect().top <= innerHeight * .5));
    figures.forEach((figure, i) => { figure.hidden = i !== index; });
  }
  function queue() { if (!tick) tick = requestAnimationFrame(select); }
  function restore() {
    cancelAnimationFrame(tick);
    tick = 0;
    removeEventListener('scroll', queue);
    removeEventListener('resize', queue);
    root.classList.remove('is-live');
    figures.forEach((figure, i) => { homes[i].after(figure); figure.hidden = false; });
    frame.hidden = true;
  }
  function layout() {
    if (!wide.matches) { restore(); return; }
    root.classList.add('is-live');
    frame.hidden = false;
    figures.forEach(figure => frame.append(figure));
    select();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
  }
  layout();
  wide.addEventListener('change', layout);
  addEventListener('beforeprint', restore);
  addEventListener('afterprint', layout);
  return { destroy() {
    wide.removeEventListener('change', layout);
    removeEventListener('beforeprint', restore);
    removeEventListener('afterprint', layout);
    restore();
    homes.forEach(marker => marker.remove());
  } };
}
