for (const root of document.querySelectorAll('[data-part="video-inview"]')) {
  const video = root.querySelector('video'),
    reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let visible = false,
    manualPause = false,
    autoPause = false;
  function sync() {
    if (!visible || document.hidden || reduce.matches) {
      if (!video.paused) {
        autoPause = true;
        video.pause();
      }
    } else if (!manualPause && !video.ended) video.play().catch(() => {});
  }
  video.onpause = () => {
    if (!autoPause && !video.ended) manualPause = true;
    autoPause = false;
  };
  video.onplay = () => (manualPause = false);
  new IntersectionObserver(
    ([e]) => {
      visible = e.intersectionRatio >= 0.6;
      sync();
    },
    { threshold: [0, 0.6] },
  ).observe(video);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
}
