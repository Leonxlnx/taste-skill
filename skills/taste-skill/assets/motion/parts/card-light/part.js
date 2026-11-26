for (const root of document.querySelectorAll('[data-part="card-light"]')) {
  const card = root.querySelector('article'),
    light = card.querySelector('i');
  const enabled = matchMedia(
    '(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
  );
  card.onpointermove = (e) => {
    if (!enabled.matches || e.pointerType === 'touch') return;
    const r = card.getBoundingClientRect();
    light.style.transform =
      'translate(' + (e.clientX - r.left - 70) + 'px,' + (e.clientY - r.top - 70) + 'px)';
    light.style.opacity = 0.35;
  };
  card.onpointerleave = () => (light.style.opacity = 0);
  enabled.onchange = () => (light.style.opacity = 0);
}
