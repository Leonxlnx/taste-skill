for (const root of document.querySelectorAll('[data-part="compare"]')) {
  const frame = root.querySelector('figure'),
    stage = frame.querySelector('.tonal-stack'),
    range = frame.querySelector('input');
  frame.dataset.ready = '';
  range.parentElement.hidden = false;
  function update() {
    frame.style.setProperty('--cut', range.value + '%');
  }
  range.oninput = update;
  update();
  function drag(e) {
    const r = stage.getBoundingClientRect();
    range.value = Math.round((100 * (e.clientX - r.left)) / r.width);
    update();
  }
  stage.style.touchAction = 'pan-y';
  stage.onpointerdown = (e) => {
    stage.setPointerCapture(e.pointerId);
    drag(e);
  };
  stage.onpointermove = (e) => {
    if (stage.hasPointerCapture(e.pointerId)) drag(e);
  };
}
