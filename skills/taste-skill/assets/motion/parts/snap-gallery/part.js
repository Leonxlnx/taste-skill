for (const root of document.querySelectorAll('[data-part="snap-gallery"]')) {
  const track = root.querySelector('.gallery-track'),
    nav = root.querySelector('.gallery-nav'),
    [prev, next] = nav.querySelectorAll('button');
  nav.hidden = false;
  function index() {
    return Math.round(track.scrollLeft / (track.firstElementChild.offsetWidth + 16));
  }
  function move(i) {
    const el = track.children[Math.max(0, Math.min(i, track.children.length - 1))];
    track.scrollTo({
      left: el.offsetLeft - track.firstElementChild.offsetLeft,
      behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
    });
  }
  prev.onclick = () => move(index() - 1);
  next.onclick = () => move(index() + 1);
  track.onkeydown = (e) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      move(
        { ArrowLeft: index() - 1, ArrowRight: index() + 1, Home: 0, End: track.children.length - 1 }[
          e.key
        ],
      );
    }
  };
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft < 1;
    next.disabled = track.scrollLeft >= max - 1;
    nav.querySelector('i').style.transform = 'scaleX(' + (1 + index()) / track.children.length + ')';
  }
  track.onscroll = update;
  new ResizeObserver(update).observe(track);
  let drag;
  track.onpointerdown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
    track.dataset.drag = '';
  };
  track.onpointermove = (e) => {
    if (drag) track.scrollLeft = drag.left + drag.x - e.clientX;
  };
  track.onlostpointercapture = () => {
    if (drag) {
      drag = null;
      delete track.dataset.drag;
      move(index());
    }
  };
}
